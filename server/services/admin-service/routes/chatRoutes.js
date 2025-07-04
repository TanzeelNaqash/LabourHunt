import express from 'express';
import chatController from '../controllers/chatController.js';

const router = express.Router();

router.post('/thread', chatController.createOrGetThread); // user
router.post('/message', chatController.sendMessage);      // user/admin
router.get('/messages', chatController.getMessages);      // user/admin
router.get('/threads', chatController.listThreads);       // admin
router.post('/thread-status', chatController.updateThreadStatus); // admin
router.post('/increment-unread', chatController.incrementUnread);
router.post('/reset-unread', chatController.resetUnread);
router.get('/unread-count', chatController.getUnreadCount);

export default router; 