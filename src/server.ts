import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { getRedisClient } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { ApiResponseHandler } from './utils/response';
import routes from './routes';
import { swaggerUi, swaggerDocument, swaggerOptions } from './swagger/swagger-setup';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  ApiResponseHandler.success(
    res,
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    'RentFit API is running'
  );
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  ApiResponseHandler.success(res, {
    message: 'Welcome to RentFit API',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// API routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  ApiResponseHandler.notFound(res, `Route ${req.originalUrl} not found`);
});

// Error handler
app.use(errorHandler);

// Initialize connections and start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    if (process.env.MONGO_URI) {
      await connectDB();
    } else {
      console.warn('⚠️  MONGO_URI not set. Skipping MongoDB connection.');
    }

    // Connect to Redis
    if (process.env.REDIS_URL) {
      getRedisClient();
    } else {
      console.warn('⚠️  REDIS_URL not set. Skipping Redis connection.');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
