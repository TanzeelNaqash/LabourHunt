import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  mobile: { type: String },
  userType: { type: String, enum: ['client', 'worker'] },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
  replies: [
    {
      message: { type: String, required: true },
      sentAt: { type: Date, default: Date.now },
      sender: { type: String, enum: ['client', 'worker', 'admin'] }
    }
  ]
}, { timestamps: true });

export default mongoose.model('Feedback', FeedbackSchema); 