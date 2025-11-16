import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  customerId: mongoose.Types.ObjectId;
  channel: 'whatsapp' | 'website' | 'email' | 'social' | 'phone';
  status: 'open' | 'unread' | 'support_request' | 'closed';
  folderId?: mongoose.Types.ObjectId;
  assignedOperatorId?: mongoose.Types.ObjectId;
  isAiManaging: boolean;
  unread: boolean;
  labels: string[];
  transcript?: Record<string, any>;
  campaignId?: mongoose.Types.ObjectId;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  channel: {
    type: String,
    enum: ['whatsapp', 'website', 'email', 'social', 'phone'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'unread', 'support_request', 'closed'],
    default: 'open'
  },
  folderId: {
    type: Schema.Types.ObjectId,
    ref: 'Folder'
  },
  assignedOperatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isAiManaging: {
    type: Boolean,
    default: true
  },
  unread: {
    type: Boolean,
    default: true
  },
  labels: [String],
  transcript: {
    type: Schema.Types.Mixed,
    default: null
  },
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  firstResponseAt: Date,
  resolvedAt: Date
}, { timestamps: true });

ConversationSchema.index({ customerId: 1 });
ConversationSchema.index({ status: 1 });
ConversationSchema.index({ channel: 1 });
ConversationSchema.index({ assignedOperatorId: 1 });
ConversationSchema.index({ createdAt: -1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
