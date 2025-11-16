import { Router, Request, Response } from 'express';
import { AutomationEngine } from '../services/automationEngine.service';
import Automation from '../models/Automation';

const router = Router();
const automationEngine = new AutomationEngine();

// Facebook webhook
router.post('/facebook', async (req: Request, res: Response) => {
  try {
    const leadData = req.body;

    // Find matching automations
    const automations = await Automation.find({
      isActive: true,
      'nodes.type': 'trigger',
      'nodes.service': 'facebook_lead'
    });

    for (const automation of automations) {
      await automationEngine.executeAutomation((automation._id as any).toString(), leadData);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Facebook webhook error:', error);
    res.status(500).json({ success: false });
  }
});

// Shopify webhook
router.post('/shopify', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;

    const automations = await Automation.find({
      isActive: true,
      'nodes.type': 'trigger',
      'nodes.service': 'shopify_order'
    });

    for (const automation of automations) {
      await automationEngine.executeAutomation((automation._id as any).toString(), orderData);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Shopify webhook error:', error);
    res.status(500).json({ success: false });
  }
});

// Generic webhook
router.post('/generic/:webhookId', async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;
    const webhookData = { ...req.body, webhookId };

    const automations = await Automation.find({
      isActive: true,
      'nodes.type': 'trigger',
      'nodes.service': 'webhook',
      'nodes.config.webhookId': webhookId
    });

    for (const automation of automations) {
      await automationEngine.executeAutomation((automation._id as any).toString(), webhookData);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Generic webhook error:', error);
    res.status(500).json({ success: false });
  }
});

export default router;
