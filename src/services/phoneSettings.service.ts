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
      twilioTrunkSid?: string;
      terminationUri?: string;
      originationUri?: string;
      humanOperatorPhone?: string;
      // Generic SIP Trunk fields
      sipAddress?: string;
      sipUsername?: string;
      providerName?: string;
      transport?: string;
      // Inbound Trunk fields
      inboundTrunkId?: string;
      inboundTrunkName?: string;
      inboundPhoneNumbers?: string[];
      inboundDispatchRuleId?: string;
      inboundDispatchRuleName?: string;
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
    if (data.twilioTrunkSid !== undefined) {
      settings.twilioTrunkSid = data.twilioTrunkSid;
    }
    if (data.terminationUri !== undefined) {
      settings.terminationUri = data.terminationUri;
    }
    if (data.originationUri !== undefined) {
      settings.originationUri = data.originationUri;
    }
    if (data.humanOperatorPhone !== undefined) {
      settings.humanOperatorPhone = data.humanOperatorPhone;
    }

    // Generic SIP Trunk fields
    if (data.sipAddress !== undefined) {
      settings.sipAddress = data.sipAddress;
    }
    if (data.sipUsername !== undefined) {
      settings.sipUsername = data.sipUsername;
    }
    if (data.providerName !== undefined) {
      settings.providerName = data.providerName;
    }
    if (data.transport !== undefined) {
      settings.transport = data.transport;
    }

    // Inbound Trunk fields
    console.log('[PhoneSettings Service] Updating inbound fields...');
    console.log('[PhoneSettings Service] Received data:', JSON.stringify(data, null, 2));
    
    if (data.inboundTrunkId !== undefined) {
      console.log('[PhoneSettings Service] Setting inboundTrunkId:', data.inboundTrunkId);
      settings.inboundTrunkId = data.inboundTrunkId;
    }
    if (data.inboundTrunkName !== undefined) {
      console.log('[PhoneSettings Service] Setting inboundTrunkName:', data.inboundTrunkName);
      settings.inboundTrunkName = data.inboundTrunkName;
    }
    if (data.inboundPhoneNumbers !== undefined) {
      console.log('[PhoneSettings Service] Setting inboundPhoneNumbers:', data.inboundPhoneNumbers);
      settings.inboundPhoneNumbers = data.inboundPhoneNumbers;
    }
    if (data.inboundDispatchRuleId !== undefined) {
      console.log('[PhoneSettings Service] Setting inboundDispatchRuleId:', data.inboundDispatchRuleId);
      settings.inboundDispatchRuleId = data.inboundDispatchRuleId;
    }
    if (data.inboundDispatchRuleName !== undefined) {
      console.log('[PhoneSettings Service] Setting inboundDispatchRuleName:', data.inboundDispatchRuleName);
      settings.inboundDispatchRuleName = data.inboundDispatchRuleName;
    }

    console.log('[PhoneSettings Service] Before save:', {
      inboundTrunkId: settings.inboundTrunkId,
      inboundTrunkName: settings.inboundTrunkName,
      inboundPhoneNumbers: settings.inboundPhoneNumbers,
      inboundDispatchRuleId: settings.inboundDispatchRuleId,
      inboundDispatchRuleName: settings.inboundDispatchRuleName,
    });

    // Check if all required fields are configured
    settings.isConfigured = !!(
      settings.selectedVoice &&
      settings.twilioPhoneNumber &&
      settings.livekitSipTrunkId
    );

    await settings.save();
    
    console.log('[PhoneSettings Service] After save:', {
      inboundTrunkId: settings.inboundTrunkId,
      inboundTrunkName: settings.inboundTrunkName,
      inboundPhoneNumbers: settings.inboundPhoneNumbers,
      inboundDispatchRuleId: settings.inboundDispatchRuleId,
      inboundDispatchRuleName: settings.inboundDispatchRuleName,
    });
    
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

