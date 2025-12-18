import InboundAgentConfig, { IInboundAgentConfig } from '../models/InboundAgentConfig';
import PhoneSettings from '../models/PhoneSettings';
import AIBehavior from '../models/AIBehavior';
import Settings from '../models/Settings';
import { AppError } from '../middleware/error.middleware';
import mongoose from 'mongoose';

export class InboundAgentConfigService {
  /**
   * Get all inbound agent configs for a user
   */
  async get(userId: string) {
    const configs = await InboundAgentConfig.find({ userId }).sort({ calledNumber: 1 });
    return configs;
  }
  
  /**
   * Get single inbound agent config by phone number
   */
  async getByPhoneNumber(userId: string, calledNumber: string) {
    const config = await InboundAgentConfig.findOne({ userId, calledNumber });
    return config;
  }

  /**
   * Sync inbound agent configs by gathering data from various settings
   * Creates one document for each inbound phone number
   */
  async syncConfig(userId: string) {
    console.log('[InboundAgentConfig Service] ==========================================');
    console.log('[InboundAgentConfig Service] SYNC CONFIG CALLED');
    console.log('[InboundAgentConfig Service] UserId:', userId);
    console.log('[InboundAgentConfig Service] ==========================================');

    // Add small delay to ensure DB has committed the changes
    await new Promise(resolve => setTimeout(resolve, 100));

    // Fetch all required settings
    const [phoneSettings, aiBehavior, settings] = await Promise.all([
      PhoneSettings.findOne({ userId }),
      AIBehavior.findOne({ userId }),
      Settings.findOne({ userId })
    ]);

    console.log('[InboundAgentConfig Service] Fetched settings:', {
      hasPhoneSettings: !!phoneSettings,
      hasAIBehavior: !!aiBehavior,
      hasSettings: !!settings,
      inboundPhoneNumbers: phoneSettings?.inboundPhoneNumbers || [],
      numberOfInboundNumbers: (phoneSettings?.inboundPhoneNumbers || []).length
    });
    
    console.log('[InboundAgentConfig Service] Full phoneSettings:', {
      userId: phoneSettings?.userId,
      inboundPhoneNumbers: phoneSettings?.inboundPhoneNumbers,
      inboundTrunkId: phoneSettings?.inboundTrunkId,
      inboundTrunkName: phoneSettings?.inboundTrunkName
    });

    // Determine voice_id (prefer customVoiceId if set, otherwise use selectedVoice)
    const voice_id = phoneSettings?.customVoiceId || phoneSettings?.selectedVoice || 'adam';
    
    // Get collections from settings (defaultKnowledgeBaseNames)
    const collections = settings?.defaultKnowledgeBaseNames || [];
    
    // Get language from AI behavior voice agent settings
    const language = aiBehavior?.voiceAgent?.language || 'en';
    
    // Get system prompt from AI behavior voice agent settings
    const agent_instruction = aiBehavior?.voiceAgent?.systemPrompt || '';

    // Get all inbound phone numbers
    const inboundPhoneNumbers = phoneSettings?.inboundPhoneNumbers || [];
    
    if (inboundPhoneNumbers.length === 0) {
      console.log('[InboundAgentConfig Service] No inbound phone numbers found');
      return [];
    }

    console.log('[InboundAgentConfig Service] Creating/updating configs for', inboundPhoneNumbers.length, 'phone numbers');

    // Create/update a config for each phone number
    const configs = [];
    for (let i = 0; i < inboundPhoneNumbers.length; i++) {
      const calledNumber = inboundPhoneNumbers[i];
      
      console.log(`[InboundAgentConfig Service] Processing phone number [${i}]:`, calledNumber);
      
      try {
        console.log(`[InboundAgentConfig Service] Looking for existing config:`, { userId, calledNumber });
        
        // Try to find existing config first
        let config = await InboundAgentConfig.findOne({ userId, calledNumber });
        
        if (config) {
          // Update existing
          console.log(`[InboundAgentConfig Service] Found existing config, updating...`);
          config.voice_id = voice_id;
          config.collections = collections;
          config.language = language;
          config.agent_instruction = agent_instruction;
          await config.save();
          console.log(`[InboundAgentConfig Service] Updated config for ${calledNumber}`);
        } else {
          // Create new
          console.log(`[InboundAgentConfig Service] No existing config found, creating new...`);
          const configData = {
            userId,
            calledNumber,
            voice_id,
            collections,
            language,
            agent_instruction
          };
          console.log(`[InboundAgentConfig Service] Creating with data:`, JSON.stringify(configData, null, 2));
          
          config = await InboundAgentConfig.create(configData);
          
          console.log(`[InboundAgentConfig Service] Created new config for ${calledNumber}, ID:`, config._id);
        }
        
        configs.push(config);
      } catch (error: any) {
        console.error(`[InboundAgentConfig Service] ERROR processing ${calledNumber}:`, error.message);
        console.error(`[InboundAgentConfig Service] Error stack:`, error.stack);
        // Continue with other numbers even if one fails
      }
    }

    // Remove configs for phone numbers that no longer exist
    const existingConfigs = await InboundAgentConfig.find({ userId });
    for (const existingConfig of existingConfigs) {
      if (!inboundPhoneNumbers.includes(existingConfig.calledNumber)) {
        console.log('[InboundAgentConfig Service] Removing obsolete config for:', existingConfig.calledNumber);
        await InboundAgentConfig.findByIdAndDelete(existingConfig._id);
      }
    }

    console.log('[InboundAgentConfig Service] Synced', configs.length, 'configs successfully');
    console.log('[InboundAgentConfig Service] Created/Updated configs for numbers:', configs.map(c => c.calledNumber));
    
    // Verify what's in DB after sync
    const allConfigsInDb = await InboundAgentConfig.find({ userId });
    console.log('[InboundAgentConfig Service] Total configs in DB for user:', allConfigsInDb.length);
    console.log('[InboundAgentConfig Service] Phone numbers in DB:', allConfigsInDb.map(c => c.calledNumber));
    
    return configs;
  }

  /**
   * Update specific fields in the inbound agent config for a specific phone number
   */
  async update(
    userId: string,
    calledNumber: string,
    data: {
      voice_id?: string;
      collections?: string[];
      language?: string;
      agent_instruction?: string;
    }
  ) {
    let config = await InboundAgentConfig.findOne({ userId, calledNumber });
    
    if (!config) {
      // Create new config if doesn't exist
      config = await InboundAgentConfig.create({
        userId,
        calledNumber,
        ...data
      });
    } else {
      // Update existing config
      if (data.voice_id !== undefined) {
        config.voice_id = data.voice_id;
      }
      if (data.collections !== undefined) {
        config.collections = data.collections;
      }
      if (data.language !== undefined) {
        config.language = data.language;
      }
      if (data.agent_instruction !== undefined) {
        config.agent_instruction = data.agent_instruction;
      }
      
      await config.save();
    }
    
    return config;
  }

  /**
   * Delete all inbound agent configs for a user
   */
  async deleteAll(userId: string): Promise<void> {
    await InboundAgentConfig.deleteMany({ userId });
  }
  
  /**
   * Delete inbound agent config for a specific phone number
   */
  async delete(userId: string, calledNumber: string): Promise<void> {
    await InboundAgentConfig.findOneAndDelete({ userId, calledNumber });
  }
}

export const inboundAgentConfigService = new InboundAgentConfigService();

