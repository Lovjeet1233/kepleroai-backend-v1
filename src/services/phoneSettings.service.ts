import PhoneSettings, { IPhoneSettings } from '../models/PhoneSettings';
import { AppError } from '../middleware/error.middleware';
import mongoose from 'mongoose';

export class PhoneSettingsService {
  /**
   * Get phone settings for a user (creates default if doesn't exist)
   */
  async get(userId: string) {
    let settings = await PhoneSettings.findOne({ userId });
    
    if (!settings) {
      // Create default settings if none exist
      settings = await PhoneSettings.create({
        userId,
        selectedVoice: 'adam',
        twilioPhoneNumber: '',
        livekitSipTrunkId: '',
        humanOperatorPhone: '',
        isConfigured: false
      });
    }
    
    return settings;
  }

  /**
   * Update phone settings
   */
  async update(
    userId: string,
    data: {
      selectedVoice?: string;
      twilioPhoneNumber?: string;
      livekitSipTrunkId?: string;
      humanOperatorPhone?: string;
    }
  ) {
    const settings = await this.get(userId);

    // Update fields
    if (data.selectedVoice !== undefined) {
      settings.selectedVoice = data.selectedVoice;
    }
    if (data.twilioPhoneNumber !== undefined) {
      settings.twilioPhoneNumber = data.twilioPhoneNumber;
    }
    if (data.livekitSipTrunkId !== undefined) {
      settings.livekitSipTrunkId = data.livekitSipTrunkId;
    }
    if (data.humanOperatorPhone !== undefined) {
      settings.humanOperatorPhone = data.humanOperatorPhone;
    }

    // Check if all required fields are configured
    settings.isConfigured = !!(
      settings.selectedVoice &&
      settings.twilioPhoneNumber &&
      settings.livekitSipTrunkId
    );

    await settings.save();
    return settings;
  }

  /**
   * Delete phone settings
   */
  async delete(userId: string): Promise<void> {
    await PhoneSettings.findOneAndDelete({ userId });
  }
}

export const phoneSettingsService = new PhoneSettingsService();

