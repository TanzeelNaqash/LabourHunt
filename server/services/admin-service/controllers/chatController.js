import ChatThread from '../models/chatThreadModel.js';
import ChatMessage from '../models/chatMessageModel.js';
import fetch from 'node-fetch';

const getUserOrWorkerDetails = async (userId, userType) => {
  if (!userId || !userType) return null;
  try {
    if (userType === 'client') {
      // Fetch from user-service
      const res = await fetch(`${process.env.USER_SERVICE_URL}/api/v1/users/${userId}`);
      if (!res.ok) return null;
      const user = await res.json();
      return {
        id: user._id,
        displayName: user.displayName || user.firstName || user.username,
        profileImage: user.profileImage || user.photo || '',
        role: 'client',
        mobile: user.mobile,
        email: user.email
      };
    } else if (userType === 'worker') {
      // Fetch from worker-service
      const res = await fetch(`${process.env.WORKER_SERVICE_URL}/api/v1/workers/${userId}`);
      if (!res.ok) return null;
      const worker = await res.json();
      return {
        id: worker._id,
        displayName: worker.displayName || worker.firstName || worker.username,
        profileImage: worker.profileImage || worker.photo || '',
        role: 'worker',
        mobile: worker.mobile,
        email: worker.email
      };
    }
  } catch {
    return null;
  }
};

const createOrGetThread = async (req, res) => {
  try {
    const { userId, userType, forceNew } = req.body;
    let thread = null;
    if (!forceNew) {
      thread = await ChatThread.findOne({ userId, userType, status: { $ne: 'closed' } });
    }
    if (!thread) {
      thread = await ChatThread.create({ userId, userType });
    }
    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { threadId, sender, senderId, message } = req.body;
    const msg = await ChatMessage.create({ threadId, sender, senderId, message });
    await ChatThread.findByIdAndUpdate(threadId, { updatedAt: Date.now() });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { threadId } = req.query;
    const messages = await ChatMessage.find({ threadId }).sort({ sentAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listThreads = async (req, res) => {
  try {
    const threads = await ChatThread.find().sort({ updatedAt: -1 });
    // Fetch user/worker details for each thread
    const threadsWithDetails = await Promise.all(threads.map(async (thread) => {
      const userDetails = await getUserOrWorkerDetails(thread.userId, thread.userType);
      return {
        ...thread.toObject(),
        userDetails,
        displayName: userDetails?.displayName || '',
        profileImage: userDetails?.profileImage || '',
        userType: userDetails?.role || thread.userType,
        mobile: userDetails?.mobile || '',
        email: userDetails?.email || '',
      };
    }));
    res.json(threadsWithDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateThreadStatus = async (req, res) => {
  try {
    const { threadId, status } = req.body;
    if (!['open', 'in_progress', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const thread = await ChatThread.findByIdAndUpdate(
      threadId,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Increment unread count for a thread (admin sends reply)
const incrementUnread = async (req, res) => {
  try {
    const { threadId } = req.body;
    const thread = await ChatThread.findByIdAndUpdate(
      threadId,
      { $inc: { unreadCount: 1 }, updatedAt: Date.now() },
      { new: true }
    );
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    res.json({ unreadCount: thread.unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset unread count for a thread (user opens chat or sends message)
const resetUnread = async (req, res) => {
  try {
    const { threadId } = req.body;
    const thread = await ChatThread.findByIdAndUpdate(
      threadId,
      { unreadCount: 0, updatedAt: Date.now() },
      { new: true }
    );
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    res.json({ unreadCount: thread.unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get unread count for a thread
const getUnreadCount = async (req, res) => {
  try {
    const { threadId } = req.query;
    const thread = await ChatThread.findById(threadId);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    res.json({ unreadCount: thread.unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  createOrGetThread,
  sendMessage,
  getMessages,
  listThreads,
  updateThreadStatus,
  incrementUnread,
  resetUnread,
  getUnreadCount,
}; 