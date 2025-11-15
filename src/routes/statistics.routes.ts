import { Router, Request, Response } from 'express';
import { StatisticsService } from '../services/statistics.service';

export const createStatisticsRoutes = (statisticsService: StatisticsService): Router => {
  const router = Router();

  router.get('/patient/:patientId', async (req: Request, res: Response): Promise<void> => {
    const patientId = parseInt(req.params.patientId);

    if (isNaN(patientId)) {
      res.status(400).json({ success: false, error: 'Invalid patient ID' });
      return;
    }

    const result = await statisticsService.getPatientStatistics(patientId);

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  router.get('/doctor/:doctorId', async (req: Request, res: Response): Promise<void> => {
    const doctorId = parseInt(req.params.doctorId);

    if (isNaN(doctorId)) {
      res.status(400).json({ success: false, error: 'Invalid doctor ID' });
      return;
    }

    const result = await statisticsService.getDoctorStatistics(doctorId);

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  });

  return router;
};
