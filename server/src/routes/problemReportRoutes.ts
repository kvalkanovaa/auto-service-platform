import { Router } from 'express';
import { getReports, createReport, getReport, deleteReport, followupReport } from '../controllers/problemReportController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/').get(getReports).post(createReport);
router.route('/:id').get(getReport).delete(deleteReport);
router.post('/:id/followup', followupReport);

export default router;
