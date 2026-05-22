import { Router } from 'express';
import {
  getServiceCenters, getServiceCenter, getServiceCenterSlots, matchServiceCenters,
  adminCreateServiceCenter, adminUpdateServiceCenter, adminDeleteServiceCenter,
  adminAddSlots, adminRefreshSlots,
} from '../controllers/serviceCenterController';
import { protect, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getServiceCenters);
router.get('/match', matchServiceCenters);
router.get('/:id', getServiceCenter);
router.get('/:id/slots', getServiceCenterSlots);

router.post('/', protect, requireRole('admin'), adminCreateServiceCenter);
router.put('/:id', protect, requireRole('admin'), adminUpdateServiceCenter);
router.delete('/:id', protect, requireRole('admin'), adminDeleteServiceCenter);
router.post('/:id/slots', protect, requireRole('admin'), adminAddSlots);
router.post('/:id/refresh-slots', protect, requireRole('admin'), adminRefreshSlots);

export default router;
