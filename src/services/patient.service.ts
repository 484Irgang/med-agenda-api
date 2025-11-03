import { PatientRepository } from '../database/repositories/patient.repository';
import { UserRepository } from '../database/repositories/user.repository';
import { NewPatient, Patient, UserType } from '../types/entities';
import { Result, createSuccess, createError } from '../types/http';

export const createPatientService = (
  patientRepository: PatientRepository,
  userRepository: UserRepository
) => ({
  completeRegistration: async (
    userId: number,
    patientData: NewPatient
  ): Promise<Result<Patient, string>> => {
    const user = await userRepository.findById(userId);

    if (!user) {
      return createError('User not found');
    }

    if (user.type !== UserType.PATIENT) {
      return createError('User is not a patient');
    }

    if (user.patientId) {
      return createError('Patient registration already completed');
    }

    const patientId = await patientRepository.create(patientData);
    await userRepository.update(userId, { patientId });

    const patient = await patientRepository.findById(patientId);

    if (!patient) {
      return createError('Failed to create patient');
    }

    return createSuccess(patient);
  },

  getAll: async (): Promise<Result<Patient[], string>> => {
    const patients = await patientRepository.findAll();
    return createSuccess(patients);
  },

  getById: async (id: number): Promise<Result<Patient, string>> => {
    const patient = await patientRepository.findById(id);

    if (!patient) {
      return createError('Patient not found');
    }

    return createSuccess(patient);
  },

  create: async (patientData: NewPatient): Promise<Result<Patient, string>> => {
    const patientId = await patientRepository.create(patientData);
    const patient = await patientRepository.findById(patientId);

    if (!patient) {
      return createError('Failed to create patient');
    }

    return createSuccess(patient);
  },

  update: async (id: number, patientData: Partial<NewPatient>): Promise<Result<Patient, string>> => {
    const existing = await patientRepository.findById(id);

    if (!existing) {
      return createError('Patient not found');
    }

    await patientRepository.update(id, patientData);
    const updated = await patientRepository.findById(id);

    if (!updated) {
      return createError('Failed to update patient');
    }

    return createSuccess(updated);
  },

  delete: async (id: number): Promise<Result<void, string>> => {
    const existing = await patientRepository.findById(id);

    if (!existing) {
      return createError('Patient not found');
    }

    await patientRepository.delete(id);
    return createSuccess(undefined);
  },
});

export type PatientService = ReturnType<typeof createPatientService>;
