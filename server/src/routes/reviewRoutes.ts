import { Router } from 'express';
import { createReview, getMyReviews, getServiceCenterReviews } from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createReview);
router.get('/mine', protect, getMyReviews);
router.get('/service-center/:id', getServiceCenterReviews);

export default router;
