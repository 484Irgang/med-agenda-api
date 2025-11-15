import { Router, Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export const createNotificationRoutes = (notificationService: NotificationService): Router => {
  const router = Router();

  router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({ success: false, error: 'Invalid user ID' });
      return;
    }

    const result = await notificationService.getByUserId(userId);

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.put('/:id/read', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid notification ID' });
      return;
    }

    const result = await notificationService.markAsRead(id);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: null });
  });

  router.put('/user/:userId/read-all', async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({ success: false, error: 'Invalid user ID' });
      return;
    }

    const result = await notificationService.markAllAsRead(userId);

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: null });
  });

  return router;
};
