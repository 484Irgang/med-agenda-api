import { Router, Request, Response } from 'express';
import { DoctorService } from '../services/doctor.service';
import { validate, doctorSchema } from '../domain/validators';
import { authenticate } from '../middleware/auth.middleware';

export const createDoctorRoutes = (doctorService: DoctorService): Router => {
  const router = Router();

  router.post('/complete-registration', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const validation = validate(doctorSchema)(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await doctorService.completeRegistration(req.user.id, validation.data);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(201).json({ success: true, data: result.data });
  });

  router.get('/', async (_req: Request, res: Response): Promise<void> => {
    const result = await doctorService.getAll();

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid doctor ID' });
      return;
    }

    const result = await doctorService.getById(id);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.post('/', async (req: Request, res: Response): Promise<void> => {
    const validation = validate(doctorSchema)(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await doctorService.create(validation.data);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(201).json({ success: true, data: result.data });
  });

  router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid doctor ID' });
      return;
    }

    const validation = validate(doctorSchema.partial())(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await doctorService.update(id, validation.data);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid doctor ID' });
      return;
    }

    const result = await doctorService.delete(id);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(204).send();
  });

  return router;
};
