import { Router } from 'express';
import { createReview, getServiceCenterReviews } from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createReview);
router.get('/service-center/:id', getServiceCenterReviews);

export default router;
