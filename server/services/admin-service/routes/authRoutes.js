import express from 'express';
import { registerAdmin, loginAdmin, createAdmin, getAllAdmins, getMe, updateMe, updatePassword, getAllUsersForAdmin, createClient, createWorker, updateUserById, deleteUserById, updateWorkerById, deleteWorkerById, deleteAdminById, getVerificationRequests, updateVerificationRequest, createVerificationRequest, requestAdminOtp, verifyAdminOtp, resetAdminPasswordWithOtp, deleteVerificationRequest, checkAdminEmailExists } from '../controllers/authController.js';
import requireAuth from '../middleware/requireAuth.js';
import { createFeedback, getAllFeedback, getFeedbackById, updateFeedbackStatus, deleteFeedback, replyFeedback, checkEmailRegistered } from '../controllers/feedbackController.js';
const router = express.Router();

// Register admin
router.post('/register', registerAdmin);

// Login admin
router.post('/login', loginAdmin);

// Get current admin profile
router.get('/me', requireAuth, getMe);

// Update current admin profile
router.patch('/me', requireAuth, updateMe);

// Update current admin password
router.patch('/me/password', requireAuth, updatePassword);

// Create admin (dashboard)
router.post('/create', createAdmin);

// Get all admins (dashboard)
router.get('/users', getAllAdmins);

// Get all users and workers for admin management
router.get('/all-users', requireAuth, getAllUsersForAdmin);

// Create client from admin dashboard
router.post('/create-client', requireAuth, createClient);

// Create worker from admin dashboard
router.post('/create-worker', requireAuth, createWorker);

// Update user by ID
router.patch('/user/:id', requireAuth, updateUserById);

// Delete user by ID
router.delete('/user/:id', requireAuth, deleteUserById);

// Update worker by ID
router.patch('/worker/:id', requireAuth, updateWorkerById);

// Delete worker by ID
router.delete('/worker/:id', requireAuth, deleteWorkerById);

// Delete admin by ID
router.delete('/admin/:id', requireAuth, deleteAdminById);

// Verification requests (admin)
router.get('/verification-requests', requireAuth, getVerificationRequests);
router.put('/verification-requests/:id', requireAuth, updateVerificationRequest);
router.delete('/verification-requests/:id', requireAuth, deleteVerificationRequest);

// Create verification request (public, for worker-service)
router.post('/verification-requests', createVerificationRequest);

// Admin forgot password (OTP)
router.post('/forgot-password/request-otp', requestAdminOtp);
router.post('/forgot-password/verify-otp', verifyAdminOtp);
router.post('/forgot-password/reset', resetAdminPasswordWithOtp);

// Feedback/support endpoints
router.post('/feedback', createFeedback);
router.get('/feedback', requireAuth, getAllFeedback);
router.get('/feedback/:id', requireAuth, getFeedbackById);
router.patch('/feedback/:id/status', requireAuth, updateFeedbackStatus);
router.delete('/feedback/:id', requireAuth, deleteFeedback);
router.post('/feedback/reply', requireAuth, replyFeedback);
router.get('/check-email', checkEmailRegistered);

// Check admin email exists
router.get('/admins/exists', checkAdminEmailExists);

export default router; 