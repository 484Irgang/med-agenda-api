import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { validate, userSchema, loginSchema } from '../domain/validators';
import { authenticate } from '../middleware/auth.middleware';

export const createAuthRoutes = (authService: AuthService): Router => {
  const router = Router();

  router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const validation = validate(userSchema)(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await authService.register(validation.data);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(201).json({ success: true, data: result.data });
  });

  router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const validation = validate(loginSchema)(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await authService.login(validation.data);

    if (!result.success) {
      res.status(401).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.post('/logout', (_req: Request, res: Response): void => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });

  router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const result = await authService.getUserById(req.user.id);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  return router;
};
