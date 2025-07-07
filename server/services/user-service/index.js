import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fileUpload  from 'express-fileupload';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
const app = express();

app.set('trust proxy', 1);

app.use(express.json({ limit: '50mb' }));




// cookie parser
app.use(cookieParser());


app.use('/api/v1/users', (req, res, next) => {
  console.log('User-service middleware:', req.method, req.path, req.headers['content-type']);
 
  // Enable file upload for registration and profile update
  if (
    req.path === '/' ||
    req.path === '/register-phone' ||
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


// CORS
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('User Service Error:', err);
  
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
app.get('/', (req, res) => res.send('User Service Running!'));

// Connect to MongoDB and start server
const PORT = process.env.USER_SERVICE_PORT ;
const MONGO_URI = process.env.USER_SERVICE_DB_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 