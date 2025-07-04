import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: { type: String, required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'workers' },
  edited: { type: Boolean, default: false },
  updatedAt: { type: Date, default: null },
  reviewerPhoto: { type: String },
});

const Review = mongoose.model('Review', reviewSchema);
export default Review; 