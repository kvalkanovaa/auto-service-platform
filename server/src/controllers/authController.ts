import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendPasswordResetEmail } from '../services/emailService';

const issueTokens = (userId: string, role: string) => {
  const access = jwt.sign({ id: userId, role }, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });
  const refresh = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  });
  return { access, refresh };
};

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const userPayload = (user: InstanceType<typeof User>) => ({
  _id: user._id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  avatarUrl: user.avatarUrl,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    const err: AppError = new Error('All fields are required');
    err.statusCode = 400;
    throw err;
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    const err: AppError = new Error('Имейл адресът вече е регистриран');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ email, password, firstName, lastName });
  const { access, refresh } = issueTokens(user._id.toString(), user.role);

  user.refreshToken = refresh;
  await user.save();

  setRefreshCookie(res, refresh);
  res.status(201).json({ token: access, user: userPayload(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err: AppError = new Error('Email and password are required');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    const err: AppError = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const { access, refresh } = issueTokens(user._id.toString(), user.role);
  user.refreshToken = refresh;
  await user.save();

  setRefreshCookie(res, refresh);
  res.json({ token: access, user: userPayload(user) });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token: string | undefined = req.cookies?.refreshToken;

  if (!token) {
    const err: AppError = new Error('No refresh token');
    err.statusCode = 401;
    throw err;
  }

  let payload: { id: string };
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
    };
  } catch {
    const err: AppError = new Error('Invalid refresh token');
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(payload.id);
  if (!user || user.refreshToken !== token) {
    const err: AppError = new Error('Refresh token revoked');
    err.statusCode = 401;
    throw err;
  }

  const { access, refresh: newRefresh } = issueTokens(
    user._id.toString(),
    user.role,
  );
  user.refreshToken = newRefresh;
  await user.save();

  setRefreshCookie(res, newRefresh);
  res.json({ token: access });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).select(
    '-password -refreshToken',
  );
  if (!user) {
    const err: AppError = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  res.json(user);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token: string | undefined = req.cookies?.refreshToken;
  if (token) {
    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null },
    );
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { firstName, lastName, email, avatarUrl } = req.body;
    const user = await User.findById(req.user!.id);
    if (!user) {
      const err: AppError = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (exists) {
        const err: AppError = new Error('Email вече се използва');
        err.statusCode = 409;
        throw err;
      }
      user.email = email.toLowerCase().trim();
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl || undefined;

    await user.save();
    res.json(userPayload(user));
  },
);

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!.id);
    if (!user) {
      const err: AppError = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      const err: AppError = new Error('Грешна текуща парола');
      err.statusCode = 400;
      throw err;
    }

    if (!newPassword || newPassword.length < 6) {
      const err: AppError = new Error(
        'Новата парола трябва да е поне 6 символа',
      );
      err.statusCode = 400;
      throw err;
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Паролата е сменена успешно' });
  },
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    // Always respond 200 so we don't leak whether an email is registered
    if (!user) {
      res.json({
        message: 'Ако имейлът съществува, ще получиш линк за смяна на парола.',
      });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendPasswordResetEmail(user.email, user.firstName, resetUrl);

    res.json({
      message: 'Ако имейлът съществува, ще получиш линк за смяна на парола.',
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      const err: AppError = new Error('Линкът е невалиден или изтекъл');
      err.statusCode = 400;
      throw err;
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Паролата е сменена успешно' });
  },
);
