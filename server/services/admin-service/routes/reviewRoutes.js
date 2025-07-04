import express from 'express';
import reviewController from '../controllers/reviewController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// Test endpoint
router.get('/test', reviewController.testEndpoint);
// Test reviews endpoint
router.get('/test-reviews', reviewController.testReviews);

// Admin: Get ALL reviews (new function, no auth required)
router.get('/all-reviews', reviewController.getAllReviewsSimple);

// Admin: List all reviews for admin (simple function, no auth required)
router.get('/admin/reviews', reviewController.getAllReviewsForAdmin);
// Admin: Delete a review (no auth required for admin access)
router.delete('/admin/reviews/:id', reviewController.deleteReview);

// Update reviewer info in all reviews for a user (public endpoint for service-to-service communication)
router.patch('/reviews/update-user-info', (req, res, next) => {
  next();
}, reviewController.updateUserInfoInReviews);

// Client: Get reviews for a worker (must come AFTER admin routes)
router.get('/reviews', reviewController.getWorkerReviews);
// Client: Add a review (must be authenticated)
router.post('/reviews', requireAuth, reviewController.createReview);
// Client: Update a review (user can update their own review)
router.patch('/reviews/:id', requireAuth, reviewController.updateReview);
// Client: Delete a review (user can delete their own review)
router.delete('/reviews/:id', requireAuth, reviewController.deleteReviewByUser);

export default router; 