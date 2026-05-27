import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Import Routes
import authRoutes from './modules/auth/auth.routes';
import taskRoutes from './modules/task/task.routes';

// Import Middleware
import { errorMiddleware } from './shared/middleware/error.middleware';
import { httpLogger } from './shared/middleware/http-logger.middleware';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins (including local IP addresses, custom domains, or mobile apps)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(httpLogger); // Log every HTTP request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Error Handling Middleware
app.use(errorMiddleware);

export default app;
