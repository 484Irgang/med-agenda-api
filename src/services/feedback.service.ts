import { FeedbackRepository } from '../database/repositories/feedback.repository';
import { Feedback, NewFeedback } from '../types/entities';
import { Result, createSuccess, createError } from '../types/http';

export const createFeedbackService = (feedbackRepository: FeedbackRepository) => ({
  create: async (feedback: NewFeedback): Promise<Result<Feedback, string>> => {
    const existing = await feedbackRepository.findByAppointmentId(feedback.appointmentId);

    if (existing) {
      return createError('Feedback already exists for this appointment');
    }

    const feedbackId = await feedbackRepository.create(feedback);
    const newFeedback = await feedbackRepository.findById(feedbackId);

    if (!newFeedback) {
      return createError('Failed to create feedback');
    }

    return createSuccess(newFeedback);
  },

  getById: async (id: number): Promise<Result<Feedback, string>> => {
    const feedback = await feedbackRepository.findById(id);

    if (!feedback) {
      return createError('Feedback not found');
    }

    return createSuccess(feedback);
  },

  getByAppointmentId: async (appointmentId: number): Promise<Result<Feedback | null, string>> => {
    const feedback = await feedbackRepository.findByAppointmentId(appointmentId);
    return createSuccess(feedback || null);
  },

  getByPatientId: async (patientId: number): Promise<Result<Feedback[], string>> => {
    const feedbacks = await feedbackRepository.findByPatientId(patientId);
    return createSuccess(feedbacks);
  },

  update: async (id: number, feedback: Partial<NewFeedback>): Promise<Result<Feedback, string>> => {
    const existing = await feedbackRepository.findById(id);

    if (!existing) {
      return createError('Feedback not found');
    }

    await feedbackRepository.update(id, feedback);
    const updated = await feedbackRepository.findById(id);

    if (!updated) {
      return createError('Failed to update feedback');
    }

    return createSuccess(updated);
  },

  delete: async (id: number): Promise<Result<void, string>> => {
    const existing = await feedbackRepository.findById(id);

    if (!existing) {
      return createError('Feedback not found');
    }

    await feedbackRepository.delete(id);
    return createSuccess(undefined);
  },
});

export type FeedbackService = ReturnType<typeof createFeedbackService>;
