import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { apiKeysService } from '../services/apiKeys.service';

export class ApiKeysController {
  /**
   * Get API keys for authenticated user
   */
  async getApiKeys(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id || req.user?.id;
      
      console.log('[API Keys] Get request from user:', userId);
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const apiKeys = await apiKeysService.getApiKeys(String(userId));
      
      console.log('[API Keys] Retrieved:', apiKeys ? 'Found' : 'Not found');
      res.json(apiKeys);
    } catch (error: any) {
      console.error('[API Keys] Error:', error);
      next(error);
    }
  }

  /**
   * Update API keys
   */
  async updateApiKeys(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const apiKeys = await apiKeysService.updateApiKeys(String(userId), req.body);
      
      res.json(apiKeys);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete API keys
   */
  async deleteApiKeys(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await apiKeysService.deleteApiKeys(String(userId));
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const apiKeysController = new ApiKeysController();

