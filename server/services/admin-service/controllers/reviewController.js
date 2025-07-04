import Review from '../models/reviewModel.js';
import mongoose from 'mongoose';

// GET /api/admin/reviews (admin: all reviews, or filter by targetId)
const getAllReviews = async (req, res) => {
  try {
    console.log('getAllReviews called with query:', req.query);
    const { targetId } = req.query;
    const filter = targetId ? { targetId } : {};
    console.log('Using filter:', filter);
    const reviews = await Review.find(filter)
      .sort({ date: -1 })
      .populate('reviewerId', 'username photo');
    console.log(`Found ${reviews.length} reviews`);
    res.json(reviews);
  } catch (err) {
    console.error('Error in getAllReviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// GET /api/reviews?targetId=... (client: reviews for a worker)
const getWorkerReviews = async (req, res) => {
  try {
    const { targetId } = req.query;
    if (!targetId) return res.status(400).json({ error: 'targetId is required' });
    // Validate ObjectId
    if (!Review.db.base.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ error: 'Invalid targetId' });
    }
    const reviews = await Review.find({ targetId })
      .sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Error in getWorkerReviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
};

// POST /api/v1/reviews
const createReview = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can add reviews' });
    }
    const { rating, text, targetId } = req.body;
    console.log('Review creation:', { user, rating, text, targetId });
    if (!rating || !text || !targetId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Prevent duplicate reviews by the same user for the same worker
    const existing = await Review.findOne({ reviewerId: user._id, targetId });
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this worker.' });
    }
    const reviewerIdValue = user._id || user.id;
    console.log('reviewerIdValue:', reviewerIdValue, 'typeof:', typeof reviewerIdValue);
    if (!reviewerIdValue) {
      throw new Error('No user._id or user.id found for reviewerId');
    }
    const review = new Review({
      reviewer: user.username,
      reviewerId: new mongoose.Types.ObjectId(reviewerIdValue),
      reviewerPhoto: user.photo, // Denormalized photo
      rating,
      text,
      targetId,
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error('Review creation error:', err);
    res.status(500).json({ error: 'Failed to create review', details: err.message });
  }
};

// PATCH /api/v1/reviews/:id (user can update their own review)
const updateReview = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { text, rating } = req.body;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.reviewerId.toString() !== user.id) {
      return res.status(403).json({ error: 'You can only update your own review' });
    }
    if (text) review.text = text;
    if (rating) review.rating = rating;
    review.edited = true;
    review.updatedAt = new Date();
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review', details: err.message });
  }
};

// DELETE /api/v1/reviews/:id (user can delete their own review)
const deleteReviewByUser = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.reviewerId.toString() !== user.id) {
      return res.status(403).json({ error: 'You can only delete your own review' });
    }
    await review.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review', details: err.message });
  }
};

// DELETE /api/admin/reviews/:id (admin only)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// PATCH /api/v1/reviews/update-user-info
const updateUserInfoInReviews = async (req, res) => {
  try {
  const { userId, username, photo } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Convert userId to ObjectId if it's a valid ObjectId string
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }
    
    // Prepare update object - only include fields that are provided
    const updateFields = {};
    if (username !== undefined) updateFields.reviewer = username;
    if (photo !== undefined) updateFields.reviewerPhoto = photo;
    
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const result = await Review.updateMany(
      { reviewerId: objectId },
      { $set: updateFields }
    );
    
    console.log('updateMany result:', result);
    res.json({ 
      success: true, 
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount 
    });
  } catch (err) {
    console.error('Error in updateUserInfoInReviews:', err);
    res.status(500).json({ error: 'Failed to update user info in reviews', details: err.message });
  }
};

// Test endpoint to verify admin service is working
const testEndpoint = async (req, res) => {
  console.log('Test endpoint hit!');
  res.json({ message: 'Admin service is working', timestamp: new Date().toISOString() });
};

// Test endpoint to check reviews in database
const testReviews = async (req, res) => {
  try {
    console.log('Test reviews endpoint hit!');
    const count = await Review.countDocuments();
    const sampleReviews = await Review.find().limit(5);
    res.json({ 
      message: 'Reviews test endpoint working', 
      count,
      sampleReviews,
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    console.error('Error in testReviews:', err);
    res.status(500).json({ error: 'Failed to test reviews', details: err.message });
  }
};

// GET /api/v1/admin/reviews - Simple function to get all reviews for admin
const getAllReviewsForAdmin = async (req, res) => {
  try {
    console.log('getAllReviewsForAdmin called');
    const reviews = await Review.find({})
      .sort({ date: -1, createdAt: -1 })
      .populate('reviewerId', 'username photo');
    console.log(`Found ${reviews.length} reviews for admin`);
    res.json(reviews);
  } catch (err) {
    console.error('Error in getAllReviewsForAdmin:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// GET /api/v1/admin/all-reviews - Get ALL reviews, no filters, for admin or analytics
const getAllReviewsSimple = async (req, res) => {
  try {
    console.log('getAllReviewsSimple called - fetching all reviews');
    const reviews = await Review.find({})
      .sort({ date: -1, createdAt: -1 })
      .populate('reviewerId', 'username photo');
    console.log(`Found ${reviews.length} total reviews`);
    res.json(reviews);
  } catch (err) {
    console.error('Error in getAllReviewsSimple:', err);
    res.status(500).json({ error: 'Failed to fetch all reviews' });
  }
};

export default {
  getAllReviews,
  getWorkerReviews,
  createReview,
  updateReview,
  deleteReviewByUser,
  deleteReview,
  updateUserInfoInReviews,
  testEndpoint,
  testReviews,
  getAllReviewsForAdmin,
  getAllReviewsSimple,
}; 