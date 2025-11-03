import { Router, Request, Response } from 'express';
import { SpecialtyService } from '../services/specialty.service';
import { validate, specialtySchema } from '../domain/validators';

export const createSpecialtyRoutes = (specialtyService: SpecialtyService): Router => {
  const router = Router();

  router.get('/', async (_req: Request, res: Response): Promise<void> => {
    const result = await specialtyService.getAll();

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid specialty ID' });
      return;
    }

    const result = await specialtyService.getById(id);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.post('/', async (req: Request, res: Response): Promise<void> => {
    const validation = validate(specialtySchema)(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await specialtyService.create(validation.data);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(201).json({ success: true, data: result.data });
  });

  router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid specialty ID' });
      return;
    }

    const validation = validate(specialtySchema)(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await specialtyService.update(id, validation.data);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid specialty ID' });
      return;
    }

    const result = await specialtyService.delete(id);

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }

    res.status(204).send();
  });

  return router;
};
