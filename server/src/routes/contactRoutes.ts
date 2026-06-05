import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { sendContactMessage } from '../services/emailService';

const router = Router();

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ message: 'Моля, попълнете всички полета.' });
    return;
  }
  await sendContactMessage(name, email, message);
  res.json({ message: 'Съобщението е изпратено успешно.' });
}));

export default router;
