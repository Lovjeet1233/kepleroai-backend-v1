import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { aiBehaviorService } from '../services/aiBehavior.service';
import { successResponse } from '../utils/response.util';

export class AIBehaviorController {
  /**
   * GET /ai-behavior
   * Get AI behavior configuration
   */
  get = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const aiBehavior = await aiBehaviorService.get(userId);
      res.json(successResponse(aiBehavior));
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /ai-behavior/chat-agent/improvements
   * Update chat agent improvements
   */
  updateChatAgentImprovements = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { improvements } = req.body;
      const aiBehavior = await aiBehaviorService.updateChatAgentImprovements(userId, improvements);
      res.json(successResponse(aiBehavior, 'Chat agent improvements updated'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /ai-behavior/chat-agent/prompt
   * Update chat agent system prompt
   */
  updateChatAgentPrompt = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { systemPrompt } = req.body;
      const aiBehavior = await aiBehaviorService.updateChatAgentPrompt(userId, systemPrompt);
      res.json(successResponse(aiBehavior, 'Chat agent prompt updated'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /ai-behavior/chat-agent/human-operator
   * Update chat agent human operator configuration
   */
  updateChatAgentHumanOperator = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { escalationRules, availability } = req.body;
      const aiBehavior = await aiBehaviorService.updateChatAgentHumanOperator(userId, {
        escalationRules,
        availability
      });
      res.json(successResponse(aiBehavior, 'Chat agent human operator configuration updated'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /ai-behavior/voice-agent/improvements
   * Update voice agent improvements
   */
  updateVoiceAgentImprovements = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { improvements } = req.body;
      const aiBehavior = await aiBehaviorService.updateVoiceAgentImprovements(userId, improvements);
      res.json(successResponse(aiBehavior, 'Voice agent improvements updated'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /ai-behavior/voice-agent/prompt
   * Update voice agent system prompt
   */
  updateVoiceAgentPrompt = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { systemPrompt } = req.body;
      const aiBehavior = await aiBehaviorService.updateVoiceAgentPrompt(userId, systemPrompt);
      res.json(successResponse(aiBehavior, 'Voice agent prompt updated'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /ai-behavior/voice-agent/human-operator
   * Update voice agent human operator configuration
   */
  updateVoiceAgentHumanOperator = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { phoneNumber, escalationRules, availability } = req.body;
      const aiBehavior = await aiBehaviorService.updateVoiceAgentHumanOperator(userId, {
        phoneNumber,
        escalationRules,
        availability
      });
      res.json(successResponse(aiBehavior, 'Voice agent human operator configuration updated'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /ai-behavior/knowledge-base
   * Set knowledge base for AI behavior
   */
  setKnowledgeBase = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { knowledgeBaseId } = req.body;
      const aiBehavior = await aiBehaviorService.setKnowledgeBase(userId, knowledgeBaseId);
      res.json(successResponse(aiBehavior, 'Knowledge base linked successfully'));
    } catch (error) {
      next(error);
    }
  };
}

export const aiBehaviorController = new AIBehaviorController();

