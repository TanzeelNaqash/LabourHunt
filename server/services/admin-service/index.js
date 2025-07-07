import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import  fileUpload  from 'express-fileupload';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import reviewRoutes from './routes/reviewRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import './models/userModel.js';
import chatRoutes from './routes/chatRoutes.js';
const app = express();

app.set('trust proxy', 1);

// cookie parser
app.use(cookieParser());

// Parse JSON for all 
app.use('/api/v1/admin', express.json({ limit: '50mb' }));

// File upload and worker routes
app.use('/api/v1/admin', (req, res, next) => {
  console.log('User-service middleware:', req.method, req.path, req.headers['content-type']);
  
  // Enable file upload for registration and profile update
  if (
    req.path === '/register' ||
    (req.path === '/me' && req.method === 'PATCH')
  ) {
    return fileUpload({
      useTempFiles: true,
      tempFileDir: '/tmp/',
      limits: { fileSize: 50 * 1024 * 1024 }
    })(req, res, next);
  }
  next();
}, authRoutes);

// Now apply express.json() for all other routes (not file upload)
app.use(express.json({ limit: '50mb' }));

// CORS
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
}));
// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`Admin Service: ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Admin Service Error:', err);
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      error: 'Payload too large', 
      message: 'The request payload is too large. Please reduce the file size or image quality.' 
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error', 
      message: err.message 
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      error: 'Invalid ID', 
      message: 'The provided ID is not valid.' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: 'Something went wrong on the server.' 
  });
});

// Health check
app.get('/', (req, res) => res.send('Admin Service Running!'));

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('Root test endpoint hit!');
  res.json({ message: 'Admin service root test working', timestamp: new Date().toISOString() });
});

// Direct update user info endpoint (bypassing route middleware)
app.patch('/update-user-info', async (req, res) => {
  console.log('Direct update-user-info endpoint hit!');
  try {
    const { userId, username, photo } = req.body;
    console.log('Received data:', { userId, username, photo });
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Import the controller function directly
    const reviewController = await import('./controllers/reviewController.js');
    return reviewController.default.updateUserInfoInReviews(req, res);
  } catch (err) {
    console.error('Error in direct update endpoint:', err);
    res.status(500).json({ error: 'Failed to update user info', details: err.message });
  }
});

// Register routes after all middleware
console.log('Registering review routes...');
app.use('/api/v1/admin', reviewRoutes);
app.use('/api/v1', reviewRoutes);
console.log('Review routes registered successfully');

// Register feedback routes
console.log('Registering feedback routes...');
app.use('/api/v1/admin', feedbackRoutes);
console.log('Feedback routes registered successfully');

// Expose feedback routes for user/worker endpoints (no /admin prefix)
app.use('/api/v1/feedback', feedbackRoutes);

// Register chat routes
console.log('Registering chat routes...');
app.use('/api/v1/chat', chatRoutes);
console.log('Chat routes registered successfully');

// Connect to MongoDB and start server
const PORT = process.env.ADMIN_SERVICE_PORT;
const MONGO_URI = process.env.ADMIN_SERVICE_DB_URI ;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Admin Service running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });