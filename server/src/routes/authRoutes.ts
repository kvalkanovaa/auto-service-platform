import { Router } from 'express';
import { register, login, refresh, me, logout, updateProfile, changePassword, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { authLimiter, forgotPasswordLimiter } from '../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validation/authSchemas';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.get('/me', protect, me);
router.post('/logout', logout);
router.put('/profile', protect, validateBody(updateProfileSchema), updateProfile);
router.put('/change-password', protect, validateBody(changePasswordSchema), changePassword);
router.post('/forgot-password', forgotPasswordLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validateBody(resetPasswordSchema), resetPassword);

export default router;
