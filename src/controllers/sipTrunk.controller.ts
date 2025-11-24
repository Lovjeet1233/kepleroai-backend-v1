import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { sipTrunkService } from '../services/sipTrunk.service';
import { phoneSettingsService } from '../services/phoneSettings.service';
import { successResponse } from '../utils/response.util';

export class SipTrunkController {
  /**
   * Setup SIP trunk with Twilio
   * POST /api/v1/phone-settings/setup-sip-trunk
   */
  async setupSipTrunk(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { label, phone_number, twilio_sid, twilio_auth_token } = req.body;

      // Validate required fields
      if (!label || !phone_number || !twilio_sid || !twilio_auth_token) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: label, phone_number, twilio_sid, twilio_auth_token'
          }
        });
      }

      // Call Python service to setup SIP trunk
      const result = await sipTrunkService.setupSipTrunk({
        label,
        phone_number,
        twilio_sid,
        twilio_auth_token
      });

      // Save LiveKit trunk ID and phone number to user's phone settings
      await phoneSettingsService.update(userId, {
        livekitSipTrunkId: result.livekit_trunk_id,
        twilioPhoneNumber: phone_number
      });

      res.json(successResponse(result, 'SIP trunk setup successful'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create LiveKit SIP trunk
   * POST /api/v1/phone-settings/create-livekit-trunk
   */
  async createLivekitTrunk(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { label, phone_number, sip_address, username, password } = req.body;

      // Validate required fields
      if (!label || !phone_number || !sip_address) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: label, phone_number, sip_address'
          }
        });
      }

      // Call Python service to create LiveKit trunk
      const result = await sipTrunkService.createLivekitTrunk({
        label,
        phone_number,
        sip_address,
        username,
        password
      });

      // Save LiveKit trunk ID and phone number to user's phone settings
      await phoneSettingsService.update(userId, {
        livekitSipTrunkId: result.livekit_trunk_id,
        twilioPhoneNumber: phone_number
      });

      res.json(successResponse(result, 'LiveKit SIP trunk created successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const sipTrunkController = new SipTrunkController();

