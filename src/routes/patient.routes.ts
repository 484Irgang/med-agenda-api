import { Router, Request, Response } from 'express';
import { PatientService } from '../services/patient.service';
import { validate, patientSchema } from '../domain/validators';
import { authenticate } from '../middleware/auth.middleware';

export const createPatientRoutes = (patientService: PatientService): Router => {
  const router = Router();

  router.post('/complete-registration', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const validation = validate(patientSchema)(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await patientService.completeRegistration(req.user.id, validation.data);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(201).json({ success: true, data: result.data });
  });

  router.get('/', async (_req: Request, res: Response): Promise<void> => {
    const result = await patientService.getAll();

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid patient ID' });
      return;
    }

    const result = await patientService.getById(id);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.post('/', async (req: Request, res: Response): Promise<void> => {
    const validation = validate(patientSchema)(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await patientService.create(validation.data);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(201).json({ success: true, data: result.data });
  });

  router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid patient ID' });
      return;
    }

    const validation = validate(patientSchema.partial())(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await patientService.update(id, validation.data);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid patient ID' });
      return;
    }

    const result = await patientService.delete(id);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(204).send();
  });

  return router;
};
