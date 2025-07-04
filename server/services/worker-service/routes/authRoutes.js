import express from 'express';
import { registerWithPhone, loginWithPhone, checkPhone, getMe, updateMe, updatePassword, resetPassword, getAllWorkers, getWorkerById, getAllWorkersForAdmin, createWorkerFromAdmin, updateWorkerById, deleteWorkerById } from '../controllers/authController.js';
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
router.get('/', getAllWorkers);

// Get all workers for admin management (public endpoint for service-to-service communication)
router.get('/all-for-admin', getAllWorkersForAdmin);

// Create worker from admin dashboard (public endpoint for service-to-service communication)
router.post('/create-from-admin', createWorkerFromAdmin);

router.get('/:id', getWorkerById);
router.patch('/:id', updateWorkerById);
router.delete('/:id', deleteWorkerById);

export default router; 