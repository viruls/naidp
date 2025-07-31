import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { Database, getDatabaseConfig } from '@naidp/db';
import { authRouter } from './routes/auth';
import { samlRouter } from './routes/saml';
import { oidcRouter } from './routes/oidc';
import { oauth2Router } from './routes/oauth2';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

async function createApp() {
  const app = express();

  // Initialize database
  const dbConfig = getDatabaseConfig();
  const database = Database.getInstance(dbConfig);
  await database.migrate();

  // Middleware
  app.use(helmet());
  app.use(morgan('combined'));
  app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use(limiter);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/auth', authRouter);
  app.use('/auth/saml', samlRouter);
  app.use('/auth/oidc', oidcRouter);
  app.use('/oauth', oauth2Router);

  // Error handling
  app.use(errorHandler);

  return app;
}

async function startServer() {
  try {
    const app = await createApp();
    const port = process.env.USER_API_PORT || 3002;
    
    app.listen(port, () => {
      console.log(`User API server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export { createApp };