import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { phoneSettingsService } from '../services/phoneSettings.service';
import { AppError } from '../middleware/error.middleware';
import { successResponse } from '../utils/response.util';

export class PhoneSettingsController {
  /**
   * GET /api/phone-settings
   * Get phone settings for the authenticated user
   */
  get = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const settings = await phoneSettingsService.get(userId);
      
      res.json(successResponse(settings));
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/phone-settings
   * Update phone settings
   */
  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { selectedVoice, twilioPhoneNumber, livekitSipTrunkId, humanOperatorPhone } = req.body;

      const settings = await phoneSettingsService.update(userId, {
        selectedVoice,
        twilioPhoneNumber,
        livekitSipTrunkId,
        humanOperatorPhone
      });

      res.json(successResponse(settings));
    } catch (error) {
      next(error);
    }
  };
}

export const phoneSettingsController = new PhoneSettingsController();

