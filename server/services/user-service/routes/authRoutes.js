import express from 'express';
import { registerWithPhone, loginWithPhone, checkPhone, getMe, updateMe, updatePassword, resetPassword, getAllUsers, getAllUsersForAdmin, createClientFromAdmin, updateUserById, deleteUserById, getUserById, checkEmail } from '../controllers/authController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/register-phone', registerWithPhone);
router.post('/login-phone', loginWithPhone);
router.post('/check-phone', checkPhone);
router.post('/login', loginWithPhone);
router.post('/', registerWithPhone);
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.patch('/me/password', requireAuth, updatePassword);
router.post('/reset-password', resetPassword);
router.get('/', getAllUsers);

// Get all users for admin management (public endpoint for service-to-service communication)
router.get('/all-for-admin', getAllUsersForAdmin);

// Create client from admin dashboard (public endpoint for service-to-service communication)
router.post('/create-from-admin', createClientFromAdmin);

router.patch('/:id', updateUserById);
router.delete('/:id', deleteUserById);
router.get('/:id', getUserById);

router.post('/check-email', checkEmail);

export default router; 