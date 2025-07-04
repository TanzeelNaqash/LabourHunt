import express from 'express';
import { createFeedback, getAllFeedback, getFeedbackById, updateFeedbackStatus, deleteFeedback, replyFeedback, checkEmailRegistered, getUserThread } from '../controllers/feedbackController.js';
import requireAuth from '../middleware/requireAuth.js';
import requireUserOrWorkerAuth from '../middleware/requireUserOrWorkerAuth.js';

const router = express.Router();

// Feedback routes
router.post('/feedback', createFeedback);
router.get('/feedback', requireAuth, getAllFeedback);
router.get('/feedback/:id', requireAuth, getFeedbackById);
router.patch('/feedback/:id/status', requireAuth, updateFeedbackStatus);
router.delete('/feedback/:id', requireAuth, deleteFeedback);
router.post('/feedback/reply', requireAuth, replyFeedback);
router.get('/check-email', checkEmailRegistered);
// User-scoped feedback thread endpoint (for client/worker chatbox)
router.get('/thread', requireUserOrWorkerAuth, getUserThread);

export default router; 