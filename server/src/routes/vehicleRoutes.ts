import { Router } from 'express';
import { getVehicles, createVehicle, getVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/').get(getVehicles).post(createVehicle);
router.route('/:id').get(getVehicle).put(updateVehicle).delete(deleteVehicle);

export default router;
