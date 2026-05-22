import { Router } from 'express';
import { analyze } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/analyze-symptoms', protect, analyze);

export default router;
