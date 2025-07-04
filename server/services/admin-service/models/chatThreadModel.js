import mongoose from 'mongoose';

const chatThreadSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userType: { type: String, enum: ['client', 'worker'], required: true },
  status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
  unreadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ChatThread = mongoose.model('ChatThread', chatThreadSchema);
export default ChatThread; 