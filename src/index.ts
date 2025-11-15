import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/environment';
import { createDatabase, initializeDatabase } from './database/schema';
import { createUserRepository } from './database/repositories/user.repository';
import { createPatientRepository } from './database/repositories/patient.repository';
import { createDoctorRepository } from './database/repositories/doctor.repository';
import { createSpecialtyRepository } from './database/repositories/specialty.repository';
import { createAppointmentRepository } from './database/repositories/appointment.repository';
import { createFeedbackRepository } from './database/repositories/feedback.repository';
import { createAuthService } from './services/auth.service';
import { createPatientService } from './services/patient.service';
import { createDoctorService } from './services/doctor.service';
import { createSpecialtyService } from './services/specialty.service';
import { createAppointmentService } from './services/appointment.service';
import { createFeedbackService } from './services/feedback.service';
import { createStatisticsService } from './services/statistics.service';
import { createNotificationService } from './services/notification.service';
import { createAuthRoutes } from './routes/auth.routes';
import { createPatientRoutes } from './routes/patient.routes';
import { createDoctorRoutes } from './routes/doctor.routes';
import { createSpecialtyRoutes } from './routes/specialty.routes';
import { createAppointmentRoutes } from './routes/appointment.routes';
import { createFeedbackRoutes } from './routes/feedback.routes';
import { createStatisticsRoutes } from './routes/statistics.routes';
import { createNotificationRoutes } from './routes/notification.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const createApp = async (): Promise<Express> => {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  const db = await createDatabase();
  await initializeDatabase(db);

  const userRepository = createUserRepository(db);
  const patientRepository = createPatientRepository(db);
  const doctorRepository = createDoctorRepository(db);
  const specialtyRepository = createSpecialtyRepository(db);
  const appointmentRepository = createAppointmentRepository(db);
  const feedbackRepository = createFeedbackRepository(db);

  const authService = createAuthService(userRepository);
  const patientService = createPatientService(patientRepository, userRepository);
  const doctorService = createDoctorService(doctorRepository, userRepository, specialtyRepository);
  const specialtyService = createSpecialtyService(specialtyRepository);
  const appointmentService = createAppointmentService(
    appointmentRepository,
    patientRepository,
    doctorRepository,
    specialtyRepository
  );
  const feedbackService = createFeedbackService(feedbackRepository);
  const statisticsService = createStatisticsService(db);
  const notificationService = createNotificationService(db);

  app.use('/auth', createAuthRoutes(authService));
  app.use('/patient', createPatientRoutes(patientService));
  app.use('/doctor', createDoctorRoutes(doctorService));
  app.use('/specialty', createSpecialtyRoutes(specialtyService));
  app.use('/appointment', createAppointmentRoutes(appointmentService));
  app.use('/feedback', createFeedbackRoutes(feedbackService));
  app.use('/statistics', createStatisticsRoutes(statisticsService));
  app.use('/notifications', createNotificationRoutes(notificationService));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

const startServer = async (): Promise<void> => {
  try {
    const app = await createApp();

    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`CORS origin: ${env.CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export { createApp };
