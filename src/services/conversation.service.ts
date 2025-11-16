import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Customer from '../models/Customer';
import { AppError } from '../middleware/error.middleware';

export class ConversationService {
  // Get all conversations with filters and pagination
  async findAll(filters: any = {}, page = 1, limit = 20) {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.channel) query.channel = filters.channel;
    if (filters.assignedTo) query.assignedOperatorId = filters.assignedTo;
    if (filters.folder) query.folderId = filters.folder;
    if (filters.label) query.labels = filters.label;

    if (filters.search) {
      const customers = await Customer.find({
        $or: [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { phone: { $regex: filters.search, $options: 'i' } }
        ]
      });
      query.customerId = { $in: customers.map(c => c._id) };
    }

    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    const skip = (page - 1) * limit;
    const total = await Conversation.countDocuments(query);

    const conversations = await Conversation.find(query)
      .populate('customerId', 'name email phone avatar color')
      .populate('assignedOperatorId', 'firstName lastName avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv: any) => {
        const lastMessage = await Message.findOne({
          conversationId: conv._id,
          type: 'message'
        })
          .sort({ timestamp: -1 })
          .lean();

        return {
          ...conv,
          lastMessage: lastMessage ? {
            id: lastMessage._id,
            text: lastMessage.text,
            sender: lastMessage.sender,
            timestamp: lastMessage.timestamp
          } : null
        };
      })
    );

    return {
      items: conversationsWithLastMessage,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Get conversation by ID with all messages
  async findById(conversationId: string) {
    console.log(`[Conversation Service] Fetching conversation: ${conversationId}`);
    
    const conversation = await Conversation.findById(conversationId)
      .populate('customerId', 'name email phone avatar color customProperties')
      .populate('assignedOperatorId', 'firstName lastName avatar')
      .lean();

    if (!conversation) {
      throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
    }

    console.log(`[Conversation Service] Found conversation for customer: ${(conversation as any).customerId?.name}`);
    console.log(`[Conversation Service] Has transcript: ${!!(conversation as any).transcript}`);

    // Query messages using both _id and string id to handle any format
    const messages = await Message.find({ 
      conversationId: (conversation as any)._id 
    })
      .populate('operatorId', 'firstName lastName avatar')
      .sort({ timestamp: 1 })
      .lean();

    console.log(`[Conversation Service] Found ${messages.length} messages for conversation ${(conversation as any)._id}`);
    if (messages.length > 0) {
      console.log(`[Conversation Service] First message:`, {
        sender: messages[0].sender,
        textPreview: messages[0].text?.substring(0, 50),
      });
    } else {
      // Debug: Check if any messages exist in the collection
      const totalMessages = await Message.countDocuments({});
      console.log(`[Conversation Service] ⚠️ No messages found. Total messages in DB: ${totalMessages}`);
      
      // Check with string comparison
      const messagesWithString = await Message.find({ 
        conversationId: conversationId 
      }).lean();
      console.log(`[Conversation Service] Messages found with string query: ${messagesWithString.length}`);
    }

    return {
      ...conversation,
      messages
    };
  }

  // Create new message
  async addMessage(conversationId: string, messageData: any) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
    }

    const message = await Message.create({
      conversationId,
      ...messageData,
      timestamp: new Date()
    });

    // Update conversation updated_at
    conversation.updatedAt = new Date();
    if (messageData.sender === 'customer') {
      conversation.unread = true;
    }
    await conversation.save();

    return message;
  }

  // Take manual control
  async takeControl(conversationId: string, operatorId: string) {
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        isAiManaging: false,
        assignedOperatorId: operatorId
      },
      { new: true }
    );

    if (!conversation) {
      throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
    }

    return conversation;
  }

  // Release control back to AI
  async releaseControl(conversationId: string) {
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { isAiManaging: true },
      { new: true }
    );

    if (!conversation) {
      throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
    }

    return conversation;
  }

  // Update conversation status
  async updateStatus(conversationId: string, status: string) {
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { status },
      { new: true }
    );

    if (!conversation) {
      throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
    }

    return conversation;
  }

  // Assign operator
  async assignOperator(conversationId: string, operatorId: string | null) {
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { assignedOperatorId: operatorId },
      { new: true }
    );

    if (!conversation) {
      throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
    }

    return conversation;
  }

  // Add/remove labels
  async updateLabels(conversationId: string, add: string[] = [], remove: string[] = []) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
    }

    if (add.length > 0) {
      conversation.labels = [...new Set([...conversation.labels, ...add])];
    }

    if (remove.length > 0) {
      conversation.labels = conversation.labels.filter(l => !remove.includes(l));
    }

    await conversation.save();
    return conversation;
  }

  // Move to folder
  async moveToFolder(conversationId: string, folderId: string | null) {
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { folderId: folderId || null },
      { new: true }
    );

    if (!conversation) {
      throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
    }

    return conversation;
  }

  // Delete conversation
  async delete(conversationId: string) {
    const conversation = await Conversation.findByIdAndDelete(conversationId);

    if (!conversation) {
      throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
    }

    // Delete all messages
    await Message.deleteMany({ conversationId });

    return { message: 'Conversation deleted successfully' };
  }

  // Bulk create conversations (for campaign transcripts)
  async bulkCreate(conversationsData: any[]) {
    const created = [];
    const failed = [];

    for (const data of conversationsData) {
      try {
        const conversation = await Conversation.create(data);
        created.push(conversation);
      } catch (error: any) {
        failed.push({
          data,
          error: error.message
        });
      }
    }

    return {
      created: created.length,
      failed: failed.length,
      conversations: created,
      errors: failed
    };
  }

  // Bulk delete
  async bulkDelete(conversationIds: string[]) {
    const result = await Conversation.deleteMany({
      _id: { $in: conversationIds }
    });

    await Message.deleteMany({
      conversationId: { $in: conversationIds }
    });

    return {
      deleted: result.deletedCount,
      failed: conversationIds.length - (result.deletedCount || 0)
    };
  }

  // Search messages
  async searchMessages(query: string, filters: any = {}) {
    const searchQuery: any = {
      $text: { $search: query },
      type: 'message'
    };

    if (filters.conversationId) {
      searchQuery.conversationId = filters.conversationId;
    }

    if (filters.dateFrom || filters.dateTo) {
      searchQuery.timestamp = {};
      if (filters.dateFrom) searchQuery.timestamp.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) searchQuery.timestamp.$lte = new Date(filters.dateTo);
    }

    const messages = await Message.find(searchQuery)
      .populate({
        path: 'conversationId',
        populate: { path: 'customerId', select: 'name avatar' }
      })
      .limit(50)
      .lean();

    return messages;
  }

  // Save widget conversation (from public widget, no user account required)
  async saveWidgetConversation(data: {
    name: string;
    threadId: string;
    collection?: string;
    messages: Array<{ role: string; content: string; timestamp: Date }>;
  }) {
    try {
      console.log('[Widget Conversation] Saving conversation for:', data.name);
      
      // Find or create customer by name
      let customer = await Customer.findOne({ name: data.name });
      
      if (!customer) {
        console.log('[Widget Conversation] Creating new customer:', data.name);
        customer = await Customer.create({
          name: data.name,
          source: 'widget'
          // status will use default from schema
        });
      }

      // Find existing conversation by threadId using dot notation
      let conversation = await Conversation.findOne({ 
        'metadata.threadId': data.threadId 
      });

      if (!conversation) {
        console.log('[Widget Conversation] Creating new conversation for thread:', data.threadId);
        conversation = await Conversation.create({
          customerId: customer._id,
          channel: 'website',
          status: 'unread', // Valid status: 'open', 'unread', 'support_request', 'closed'
          isAiManaging: true, // Widget conversations are AI managed
          metadata: {
            threadId: data.threadId,
            collection: data.collection
          }
        });
      }

      // Add messages
      console.log('[Widget Conversation] Adding', data.messages.length, 'messages');
      for (const msg of data.messages) {
        await Message.create({
          conversationId: conversation._id,
          sender: msg.role === 'user' ? 'customer' : 'ai', // Valid values: 'customer', 'ai', 'operator'
          text: msg.content, // Message model uses 'text' not 'content'
          type: 'message', // Default message type
          timestamp: msg.timestamp
        });
      }

      // Update conversation updatedAt
      conversation.updatedAt = new Date();
      await conversation.save();

      console.log('[Widget Conversation] ✅ Conversation saved successfully');
      return conversation;
    } catch (error: any) {
      console.error('[Widget Conversation] ❌ Error saving conversation:', error);
      throw new AppError(
        500, 
        'SAVE_ERROR', 
        `Failed to save widget conversation: ${error.message}`
      );
    }
  }
}

export const conversationService = new ConversationService();
