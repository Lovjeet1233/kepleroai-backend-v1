import Automation from '../models/Automation';
import AutomationExecution from '../models/AutomationExecution';
import Customer from '../models/Customer';
import ContactListMember from '../models/ContactListMember';
import Campaign from '../models/Campaign';
import PhoneSettings from '../models/PhoneSettings';
import { WhatsAppService } from './whatsapp.service';
import { AppError } from '../middleware/error.middleware';
import axios from 'axios';

const COMM_API = process.env.COMM_API || 'http://localhost:8000';

const VOICE_ID_MAP: Record<string, string> = {
  'adam': 'pNInz6obpgDQGcFmaJgB',
  'alice': '21m00Tcm4TlvDq8ikWAM',
  'rachel': 'XrExE9yKIg1WjnnlVkGX',
  'charlie': 'IKne3meq5aSn9XLyUdCD',
  'jessica': 'cgSgspJ2msm6clMCkdW9',
  'sophia': 'pFZP5JQG7iQjIQuC4Bku',
  'domi': 'AZnzlk1XvdvUeBnXmlld',
};

interface TriggerHandler {
  validate(config: any, data: any): Promise<boolean>;
}

interface ActionHandler {
  execute(config: any, triggerData: any, context?: any): Promise<any>;
}

export class AutomationEngine {
  private triggers: Map<string, TriggerHandler>;
  private actions: Map<string, ActionHandler>;
  private whatsappService: WhatsAppService;

  constructor() {
    this.triggers = new Map();
    this.actions = new Map();
    this.whatsappService = new WhatsAppService();
    
    this.registerHandlers();
  }

  private registerHandlers() {
    // ============ KEPLERO AI TRIGGERS ============
    
    // Contact Created Trigger
    this.triggers.set('keplero_contact_created', {
      validate: async (config, data) => {
        // Trigger fires when a new contact is created
        return data.event === 'contact_created';
      }
    });

    // Contact Deleted Trigger
    this.triggers.set('keplero_contact_deleted', {
      validate: async (config, data) => {
        return data.event === 'contact_deleted';
      }
    });

    // Contact Moved to List Trigger
    this.triggers.set('keplero_contact_moved', {
      validate: async (config, data) => {
        // Check if contact was moved to the specified list
        return data.event === 'contact_moved' && 
               (!config.listId || data.listId === config.listId);
      }
    });

    // Mass Sending (Campaign) Trigger
    this.triggers.set('keplero_mass_sending', {
      validate: async (config, data) => {
        // This trigger fires when mass sending is initiated
        // Either from CSV import or list selection
        return data.event === 'mass_sending' && 
               (data.source === 'csv' || data.source === 'list');
      }
    });

    // Legacy triggers (keep for backward compatibility)
    this.triggers.set('facebook_lead', {
      validate: async (config, data) => {
        return data.pageId === config.pageId && data.formId === config.formId;
      }
    });

    this.triggers.set('shopify_order', {
      validate: async (config, data) => {
        return data.storeId === config.storeId;
      }
    });

    this.triggers.set('cart_abandoned', {
      validate: async (config, data) => {
        const abandonedMinutes = (Date.now() - data.abandonedAt) / (1000 * 60);
        return abandonedMinutes >= config.timeThreshold;
      }
    });

    this.triggers.set('webhook', {
      validate: async (config, data) => {
        return data.webhookId === config.webhookId;
      }
    });

    // ============ KEPLERO AI ACTIONS ============

    // API Call Action
    this.actions.set('keplero_api_call', {
      execute: async (config, triggerData) => {
        const { url, method = 'GET', headers = {}, body, params = {} } = config;
        
        try {
          const response = await axios({
            method,
            url,
            headers: {
              'Content-Type': 'application/json',
              ...headers
            },
            params,
            data: body ? JSON.parse(body) : undefined,
            timeout: 30000
          });

          return {
            success: true,
            status: response.status,
            data: response.data
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            status: error.response?.status
          };
        }
      }
    });

    // Create Contact Action
    this.actions.set('keplero_create_contact', {
      execute: async (config, triggerData) => {
        const { name, email, phone, tags = [], lists = [] } = config;

        // Check if contact already exists
        let contact;
        if (email) {
          contact = await Customer.findOne({ email });
        }

        if (contact) {
          return { success: false, message: 'Contact already exists', contactId: contact._id };
        }

        // Create new contact
        contact = await Customer.create({
          name,
          email,
          phone,
          tags
        });

        // Add to lists
        if (lists && lists.length > 0) {
          for (const listId of lists) {
            await ContactListMember.create({
              contactId: contact._id,
              listId
            }).catch(() => {});
          }
        }

        return { 
          success: true, 
          contactId: contact._id,
          message: 'Contact created successfully'
        };
      }
    });

    // Outbound Call Action
    this.actions.set('keplero_outbound_call', {
      execute: async (config, triggerData, context) => {
        const contactId = triggerData.contactId || config.contactId;
        
        if (!contactId) {
          throw new Error('Contact ID is required for outbound call');
        }

        // Get contact details
        const contact = await Customer.findById(contactId);
        if (!contact || !contact.phone) {
          throw new Error('Contact not found or phone number missing');
        }

        // Get phone settings - find any configured settings if userId not provided
        let phoneSettings;
        if (context?.userId) {
          phoneSettings = await PhoneSettings.findOne({ userId: context.userId });
        } else {
          // Find the first configured phone settings
          phoneSettings = await PhoneSettings.findOne({ isConfigured: true });
        }
        
        if (!phoneSettings || !phoneSettings.isConfigured) {
          throw new Error('Phone settings not configured. Please configure phone settings in the Settings page.');
        }

        const voiceId = VOICE_ID_MAP[phoneSettings.selectedVoice] || VOICE_ID_MAP['adam'];
        
        // Prepare call request
        const callRequestBody: any = {
          phone_number: contact.phone,
          name: contact.name || 'Customer',
          dynamic_instruction: config.dynamicInstruction || 'Have a friendly conversation',
          language: config.language || 'en',
          voice_id: voiceId,
          sip_trunk_id: phoneSettings.livekitSipTrunkId,
        };

        // Add optional fields
        if (config.transferTo || phoneSettings.humanOperatorPhone) {
          callRequestBody.transfer_to = config.transferTo || phoneSettings.humanOperatorPhone;
        }
        if (config.escalationCondition) {
          callRequestBody.escalation_condition = config.escalationCondition;
        }

        try {
          console.log(`[Automation] Making outbound call to ${COMM_API}/calls/outbound`);
          console.log(`[Automation] Call request body:`, JSON.stringify(callRequestBody, null, 2));
          
          const callResponse = await axios.post(`${COMM_API}/calls/outbound`, callRequestBody, {
            timeout: 360000,
          });

          console.log(`[Automation] Call response:`, callResponse.data);

          return {
            success: true,
            status: callResponse.data.status,
            transcript: callResponse.data.transcript || null,
            contactId: contact._id,
            phone: contact.phone
          };
        } catch (error: any) {
          console.error(`[Automation] Outbound call error:`, {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            code: error.code
          });
          
          return {
            success: false,
            error: error.response?.data?.message || error.message || 'Call failed',
            errorDetails: error.code === 'ECONNREFUSED' ? 'Python backend not reachable' : error.message,
            contactId: contact._id,
            phone: contact.phone
          };
        }
      }
    });

    // SMS Sending Action
    this.actions.set('keplero_send_sms', {
      execute: async (config, triggerData) => {
        const contactId = triggerData.contactId || config.contactId;
        const message = config.message || '';

        if (!contactId) {
          throw new Error('Contact ID is required for SMS');
        }

        const contact = await Customer.findById(contactId);
        if (!contact || !contact.phone) {
          throw new Error('Contact not found or phone number missing');
        }

        // TODO: Implement actual SMS sending via Twilio or similar service
        // For now, return success placeholder
        return {
          success: true,
          contactId: contact._id,
          phone: contact.phone,
          message,
          sentAt: new Date()
        };
      }
    });

    // Email Sending Action
    this.actions.set('keplero_send_email', {
      execute: async (config, triggerData) => {
        const contactId = triggerData.contactId || config.contactId;
        const { subject, body, template } = config;

        if (!contactId) {
          throw new Error('Contact ID is required for email');
        }

        const contact = await Customer.findById(contactId);
        if (!contact || !contact.email) {
          throw new Error('Contact not found or email missing');
        }

        // TODO: Implement actual email sending
        // For now, return success placeholder
        return {
          success: true,
          contactId: contact._id,
          email: contact.email,
          subject,
          sentAt: new Date()
        };
      }
    });

    // WhatsApp Template Action
    this.actions.set('send_whatsapp', {
      execute: async (config, triggerData) => {
        const { templateId, delay, delayUnit } = config;
        const contactId = triggerData.contactId;

        if (delay && delay > 0) {
          await this.delay(delay, delayUnit);
        }

        const contact = await Customer.findById(contactId);
        if (!contact || !contact.phone) {
          throw new Error('Contact not found or phone missing');
        }

        const result = await this.whatsappService.sendTemplate(
          contact.phone,
          templateId,
          'en',
          config.variables || {}
        );

        return result;
      }
    });

    // Legacy actions
    this.actions.set('send_email', {
      execute: async (config, triggerData) => {
        return { sent: true, email: triggerData.email };
      }
    });

    this.actions.set('save_to_crm', {
      execute: async (config, triggerData) => {
        return { saved: true };
      }
    });

    this.actions.set('add_tag', {
      execute: async (config, triggerData) => {
        const contact = await Customer.findById(triggerData.contactId);
        if (contact) {
          contact.tags.push(config.tag);
          await contact.save();
          return { added: true, tag: config.tag };
        }
        return { added: false };
      }
    });

    this.actions.set('add_to_list', {
      execute: async (config, triggerData) => {
        await ContactListMember.create({
          contactId: triggerData.contactId,
          listId: config.listId
        }).catch(() => {});
        return { added: true, listId: config.listId };
      }
    });
  }

  async executeAutomation(automationId: string, triggerData: any, context?: any) {
    const automation = await Automation.findById(automationId);

    if (!automation || !automation.isActive) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Automation not found or inactive');
    }

    const execution = await AutomationExecution.create({
      automationId,
      status: 'pending',
      triggerData
    });

    try {
      // Sort nodes by position
      const sortedNodes = automation.nodes.sort((a, b) => a.position - b.position);

      // Get trigger node
      const triggerNode = sortedNodes.find(n => n.type === 'trigger');
      if (!triggerNode) {
        throw new Error('No trigger node found');
      }

      // Validate trigger
      const triggerHandler = this.triggers.get(triggerNode.service);
      if (!triggerHandler) {
        throw new Error(`Trigger handler not found: ${triggerNode.service}`);
      }

      const isValid = await triggerHandler.validate(triggerNode.config, triggerData);
      if (!isValid) {
        execution.status = 'failed';
        execution.errorMessage = 'Trigger validation failed';
        await execution.save();
        return;
      }

      const actionResults: any[] = [];

      // Execute delay nodes and action nodes in sequence
      for (const node of sortedNodes) {
        if (node.type === 'delay') {
          await this.delay(node.config.delay, node.config.delayUnit);
        } else if (node.type === 'action') {
          const actionHandler = this.actions.get(node.service);
          if (!actionHandler) {
            throw new Error(`Action handler not found: ${node.service}`);
          }

          const actionResult = await actionHandler.execute(node.config, triggerData, context);
          actionResults.push({
            nodeId: node.id,
            service: node.service,
            result: actionResult
          });
        }
      }

      // Update execution as success
      execution.status = 'success';
      execution.actionData = actionResults;
      await execution.save();

      // Update automation stats
      automation.executionCount += 1;
      automation.lastExecutedAt = new Date();
      await automation.save();

      return {
        success: true,
        executionId: execution._id,
        results: actionResults
      };

    } catch (error: any) {
      execution.status = 'failed';
      execution.errorMessage = error.message;
      await execution.save();
      throw error;
    }
  }

  // Method to trigger automation based on event
  async triggerByEvent(event: string, eventData: any, context?: any) {
    // Find all active automations with this trigger
    const automations = await Automation.find({ isActive: true });

    const results = [];

    for (const automation of automations) {
      const triggerNode = automation.nodes.find(n => n.type === 'trigger');
      
      if (!triggerNode) continue;

      // Check if trigger matches the event
      const triggerHandler = this.triggers.get(triggerNode.service);
      if (!triggerHandler) continue;

      try {
        const isValid = await triggerHandler.validate(triggerNode.config, eventData);
        
        if (isValid) {
          const automationId = (automation._id as any).toString();
          // Execute automation asynchronously
          this.executeAutomation(automationId, eventData, context)
            .catch(err => {
              console.error(`Error executing automation ${automationId}:`, err);
            });
          
          results.push({
            automationId: automation._id,
            name: automation.name,
            triggered: true
          });
        }
      } catch (error) {
        console.error(`Error validating trigger for automation ${automation._id}:`, error);
      }
    }

    return results;
  }

  private delay(amount: number, unit: string): Promise<void> {
    const multipliers: Record<string, number> = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000
    };

    const ms = amount * (multipliers[unit] || 1000);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testAutomation(automationId: string, testData: any) {
    const automation = await Automation.findById(automationId);

    if (!automation) {
      throw new AppError(404, 'NOT_FOUND', 'Automation not found');
    }

    try {
      await this.executeAutomation(automationId, testData);
      return {
        testId: 'test_' + Date.now(),
        status: 'success',
        result: {
          triggered: true,
          actionExecuted: true,
          message: 'Test completed successfully'
        }
      };
    } catch (error: any) {
      return {
        testId: 'test_' + Date.now(),
        status: 'failed',
        result: {
          triggered: false,
          actionExecuted: false,
          message: error.message
        }
      };
    }
  }
}

export const automationEngine = new AutomationEngine();

