import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = (result.error as ZodError).issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      res.status(400).json({ message: 'Validation failed', errors: issues });
      return;
    }
    req.body = result.data;
    next();
  };
