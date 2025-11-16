import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger.util';
import authRoutes from './routes/auth.routes';
import conversationRoutes from './routes/conversation.routes';
import folderRoutes from './routes/folder.routes';
import labelRoutes from './routes/label.routes';
import templateRoutes from './routes/template.routes';
import knowledgeBaseRoutes from './routes/knowledgeBase.routes';
import promptRoutes from './routes/prompt.routes';
import aiBehaviorRoutes from './routes/aiBehavior.routes';
import chatbotRoutes from './routes/chatbot.routes';
import contactRoutes from './routes/contact.routes';
import campaignRoutes from './routes/campaign.routes';
import automationRoutes from './routes/automation.routes';
import webhookRoutes from './routes/webhook.routes';
import analyticsRoutes from './routes/analytics.routes';
import phoneSettingsRoutes from './routes/phoneSettings.routes';
import toolRoutes from './routes/tool.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Root endpoint with API information
app.get('/', (req, res) => {
  res.json({
    name: 'AI Chatbot Management Platform API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      conversations: '/api/v1/conversations',
      contacts: '/api/v1/contacts',
      campaigns: '/api/v1/campaigns',
      automations: '/api/v1/automations',
      analytics: '/api/v1/analytics',
      knowledgeBase: '/api/v1/training/knowledge-bases',
      knowledgeBasesAlias: '/api/v1/knowledge-bases',
      prompts: '/api/v1/training/prompts',
      aiBehavior: '/api/v1/ai-behavior',
      chatbot: '/api/v1/chatbot',
      webhooks: '/api/v1/webhooks',
      phoneSettings: '/api/v1/phone-settings',
      tools: '/api/v1/tools'
    },
    documentation: 'Swagger UI not yet implemented - use Postman collection',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
// Note: Folder and label routes MUST come before conversations route to avoid routing conflicts
app.use('/api/v1/conversations/folders', folderRoutes);
app.use('/api/v1/conversations/labels', labelRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/settings/templates', templateRoutes);
app.use('/api/v1/training/knowledge-bases', knowledgeBaseRoutes);
app.use('/api/v1/knowledge-bases', knowledgeBaseRoutes); // Alias for easier access
app.use('/api/v1/training/prompts', promptRoutes);
app.use('/api/v1/ai-behavior', aiBehaviorRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/automations', automationRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/phone-settings', phoneSettingsRoutes);
app.use('/api/v1/tools', toolRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Connect to Redis
    await connectRedis();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error: any) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

startServer();

