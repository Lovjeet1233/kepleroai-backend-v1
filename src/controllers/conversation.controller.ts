import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ConversationService } from '../services/conversation.service';
import { successResponse, paginatedResponse } from '../utils/response.util';

export class ConversationController {
  private conversationService: ConversationService;

  constructor() {
    this.conversationService = new ConversationService();
  }

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      const result = await this.conversationService.findAll(
        filters,
        Number(page),
        Number(limit)
      );
      res.json(paginatedResponse(
        result.items,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total
      ));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const conversation = await this.conversationService.findById(req.params.conversationId);
      res.json(successResponse(conversation));
    } catch (error) {
      next(error);
    }
  };

  addMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const message = await this.conversationService.addMessage(
        req.params.conversationId,
        {
          ...req.body,
          operatorId: req.body.sender === 'operator' ? req.user._id : null
        }
      );
      res.json(successResponse(message, 'Message sent'));
    } catch (error) {
      next(error);
    }
  };

  takeControl = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const conversation = await this.conversationService.takeControl(
        req.params.conversationId,
        req.user._id
      );
      res.json(successResponse(conversation, 'Control taken'));
    } catch (error) {
      next(error);
    }
  };

  releaseControl = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const conversation = await this.conversationService.releaseControl(
        req.params.conversationId
      );
      res.json(successResponse(conversation, 'Control released'));
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const conversation = await this.conversationService.updateStatus(
        req.params.conversationId,
        req.body.status
      );
      res.json(successResponse(conversation, 'Status updated'));
    } catch (error) {
      next(error);
    }
  };

  assignOperator = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const conversation = await this.conversationService.assignOperator(
        req.params.conversationId,
        req.body.operatorId
      );
      res.json(successResponse(conversation, 'Operator assigned'));
    } catch (error) {
      next(error);
    }
  };

  updateLabels = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const conversation = await this.conversationService.updateLabels(
        req.params.conversationId,
        req.body.add,
        req.body.remove
      );
      res.json(successResponse(conversation, 'Labels updated'));
    } catch (error) {
      next(error);
    }
  };

  moveToFolder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const conversation = await this.conversationService.moveToFolder(
        req.params.conversationId,
        req.body.folderId
      );
      res.json(successResponse(conversation, 'Moved to folder'));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.conversationService.delete(req.params.conversationId);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  bulkCreate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.conversationService.bulkCreate(req.body.conversations);
      res.json(successResponse(result, 'Conversations created'));
    } catch (error) {
      next(error);
    }
  };

  bulkDelete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.conversationService.bulkDelete(req.body.conversationIds);
      res.json(successResponse(result, 'Conversations deleted'));
    } catch (error) {
      next(error);
    }
  };

  searchMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { query, ...filters } = req.query;
      const results = await this.conversationService.searchMessages(query as string, filters);
      res.json(successResponse({ results, total: results.length }));
    } catch (error) {
      next(error);
    }
  };

  // Save widget conversation (no auth required for public widget)
  saveWidgetConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, threadId, collection, messages } = req.body;
      
      const conversation = await this.conversationService.saveWidgetConversation({
        name,
        threadId,
        collection,
        messages
      });

      res.json(successResponse(conversation, 'Conversation saved'));
    } catch (error) {
      next(error);
    }
  };
}

export const conversationController = new ConversationController();
