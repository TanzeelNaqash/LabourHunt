import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();

app.set('trust proxy', 1);


app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to LabourHunt API Gateway',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});


// Security middleware
app.use(helmet());


app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging middleware
app.use(morgan('combined'));

// Service URLs
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL ;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL ;
const WORKER_SERVICE_URL = process.env.WORKER_SERVICE_URL ;

// Proxy options
const proxyOptions = {
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`${req.method} ${req.url} -> ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy Error: ${err.message}`);
    res.status(500).json({ error: 'Proxy Error' });
  }
};


// User Service Routes
app.use('/api/v1/users', createProxyMiddleware({
  ...proxyOptions,
  target: USER_SERVICE_URL
}));
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
}); 
// Worker Service Routes
app.use('/api/v1/workers', createProxyMiddleware({
  ...proxyOptions,
  target: WORKER_SERVICE_URL
}));

// Proxy /api/v1/reviews and /api/reviews to admin-service
app.use('/api/v1/reviews', createProxyMiddleware({
  ...proxyOptions,
  target: ADMIN_SERVICE_URL
}));
app.use('/api/reviews', createProxyMiddleware({
  ...proxyOptions,
  target: ADMIN_SERVICE_URL
}));

// Admin Service Routes
app.use('/api/v1/admin', createProxyMiddleware({
  ...proxyOptions,
  target: ADMIN_SERVICE_URL
}));

// Proxy /api/v1/feedback to admin-service
app.use('/api/v1/feedback', createProxyMiddleware({
  ...proxyOptions,
  target: ADMIN_SERVICE_URL
}));

// Proxy /api/v1/chat to admin-service
app.use('/api/v1/chat', createProxyMiddleware({
  ...proxyOptions,
  target: ADMIN_SERVICE_URL
}));

app.use(express.json());
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'API Gateway is healthy',
    timestamp: new Date().toISOString(),
    services: {
      user: USER_SERVICE_URL,
      admin: ADMIN_SERVICE_URL,
      worker: WORKER_SERVICE_URL
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.GATEWAY_PORT;
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});
