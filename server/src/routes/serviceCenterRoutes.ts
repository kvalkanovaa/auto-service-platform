import { Router } from 'express';
import {
  getServiceCenters, getServiceCenter, getServiceCenterSlots, matchServiceCenters,
  applyServiceCenter, getPendingServiceCenters, approveServiceCenter,
  adminCreateServiceCenter, adminUpdateServiceCenter, adminDeleteServiceCenter,
  adminAddSlots, adminRefreshSlots,
} from '../controllers/serviceCenterController';
import { protect, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getServiceCenters);
router.get('/match', matchServiceCenters);
router.get('/pending', protect, requireRole('admin'), getPendingServiceCenters); // before '/:id'
router.get('/:id', getServiceCenter);
router.get('/:id/slots', getServiceCenterSlots);

router.post('/apply', applyServiceCenter); // public application
router.post('/', protect, requireRole('admin'), adminCreateServiceCenter);
router.patch('/:id/approve', protect, requireRole('admin'), approveServiceCenter);
router.put('/:id', protect, requireRole('admin'), adminUpdateServiceCenter);
router.delete('/:id', protect, requireRole('admin'), adminDeleteServiceCenter);
router.post('/:id/slots', protect, requireRole('admin'), adminAddSlots);
router.post('/:id/refresh-slots', protect, requireRole('admin'), adminRefreshSlots);

export default router;
