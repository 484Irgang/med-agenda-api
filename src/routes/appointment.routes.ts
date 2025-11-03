import { Router, Request, Response } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { validate, appointmentSchema } from '../domain/validators';
import { authenticate } from '../middleware/auth.middleware';

export const createAppointmentRoutes = (appointmentService: AppointmentService): Router => {
  const router = Router();

  router.get('/', async (_req: Request, res: Response): Promise<void> => {
    const result = await appointmentService.getAll();

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid appointment ID' });
      return;
    }

    const result = await appointmentService.getById(id);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.get('/by-patient/:patientId', async (req: Request, res: Response): Promise<void> => {
    const patientId = parseInt(req.params.patientId);

    if (isNaN(patientId)) {
      res.status(400).json({ success: false, error: 'Invalid patient ID' });
      return;
    }

    const result = await appointmentService.getByPatientId(patientId);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.get('/by-doctor/:doctorId', async (req: Request, res: Response): Promise<void> => {
    const doctorId = parseInt(req.params.doctorId);

    if (isNaN(doctorId)) {
      res.status(400).json({ success: false, error: 'Invalid doctor ID' });
      return;
    }

    const result = await appointmentService.getByDoctorId(doctorId);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    const validation = validate(appointmentSchema)(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await appointmentService.create(validation.data);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(201).json({ success: true, data: result.data });
  });

  router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid appointment ID' });
      return;
    }

    const validation = validate(appointmentSchema.partial())(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await appointmentService.update(id, validation.data);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid appointment ID' });
      return;
    }

    const result = await appointmentService.delete(id);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(204).send();
  });

  return router;
};
