import { Router, Request, Response } from 'express';
import { FeedbackService } from '../services/feedback.service';
import { validate, feedbackSchema } from '../domain/validators';
import { authenticate } from '../middleware/auth.middleware';

export const createFeedbackRoutes = (feedbackService: FeedbackService): Router => {
  const router = Router();

  router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    const validation = validate(feedbackSchema)(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const feedbackData = {
      ...validation.data,
      comment: validation.data.comment || null,
    };

    const result = await feedbackService.create(feedbackData);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(201).json({ success: true, data: result.data });
  });

  router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid feedback ID' });
      return;
    }

    const result = await feedbackService.getById(id);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.get('/appointment/:appointmentId', async (req: Request, res: Response): Promise<void> => {
    const appointmentId = parseInt(req.params.appointmentId);

    if (isNaN(appointmentId)) {
      res.status(400).json({ success: false, error: 'Invalid appointment ID' });
      return;
    }

    const result = await feedbackService.getByAppointmentId(appointmentId);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.get('/patient/:patientId', async (req: Request, res: Response): Promise<void> => {
    const patientId = parseInt(req.params.patientId);

    if (isNaN(patientId)) {
      res.status(400).json({ success: false, error: 'Invalid patient ID' });
      return;
    }

    const result = await feedbackService.getByPatientId(patientId);

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid feedback ID' });
      return;
    }

    const validation = validate(feedbackSchema.partial())(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await feedbackService.update(id, validation.data);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid feedback ID' });
      return;
    }

    const result = await feedbackService.delete(id);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(204).send();
  });

  return router;
};
