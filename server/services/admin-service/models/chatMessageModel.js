import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatThread', required: true },
  sender: { type: String, enum: ['admin', 'client', 'worker'], required: true },
  senderId: { type: String, required: true },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage; 