import { Router } from 'express';
import { phoneSettingsController } from '../controllers/phoneSettings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get phone settings
router.get('/', phoneSettingsController.get);

// Update phone settings
router.put('/', phoneSettingsController.update);

export default router;

