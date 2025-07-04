import mongoose from 'mongoose';

const VerificationRequestSchema = new mongoose.Schema({
  user: {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Worker' },
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    profilePicture: String,
    category: String,
    location: String,
    isEmailVerified: Boolean,
    isPhoneVerified: Boolean,
    bio: String,
    skills: [String],
    experience: String,
    education: String,
    idProofUrl: String,
  },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  notes: { type: String, default: '' },
  requestDate: { type: Date, default: Date.now },
  reviewDate: { type: Date },
}, { timestamps: true });

export default mongoose.model('VerificationRequest', VerificationRequestSchema); 