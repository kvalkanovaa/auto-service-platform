import { Router } from 'express';
import { createBooking, getMyBookings, getBooking, cancelBooking } from '../controllers/bookingController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/', createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBooking);
router.patch('/:id/cancel', cancelBooking);

export default router;
