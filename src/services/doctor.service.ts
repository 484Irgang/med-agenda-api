import { DoctorRepository } from '../database/repositories/doctor.repository';
import { UserRepository } from '../database/repositories/user.repository';
import { SpecialtyRepository } from '../database/repositories/specialty.repository';
import { NewDoctor, Doctor, UserType } from '../types/entities';
import { Result, createSuccess, createError } from '../types/http';

export const createDoctorService = (
  doctorRepository: DoctorRepository,
  userRepository: UserRepository,
  specialtyRepository: SpecialtyRepository
) => ({
  completeRegistration: async (
    userId: number,
    doctorData: NewDoctor
  ): Promise<Result<Doctor, string>> => {
    const user = await userRepository.findById(userId);

    if (!user) {
      return createError('User not found');
    }

    if (user.type !== UserType.DOCTOR) {
      return createError('User is not a doctor');
    }

    if (user.doctorId) {
      return createError('Doctor registration already completed');
    }

    if (doctorData.specialtyId) {
      const specialty = await specialtyRepository.findById(doctorData.specialtyId);
      if (!specialty) {
        return createError('Specialty not found');
      }
    }

    const existingCrm = await doctorRepository.findByCrm(doctorData.crm);
    if (existingCrm) {
      return createError('CRM already registered');
    }

    const doctorId = await doctorRepository.create(doctorData);
    await userRepository.update(userId, { doctorId });

    const doctor = await doctorRepository.findById(doctorId);

    if (!doctor) {
      return createError('Failed to create doctor');
    }

    return createSuccess(doctor);
  },

  getAll: async (): Promise<Result<Doctor[], string>> => {
    const doctors = await doctorRepository.findAll();
    return createSuccess(doctors);
  },

  getById: async (id: number): Promise<Result<Doctor, string>> => {
    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      return createError('Doctor not found');
    }

    return createSuccess(doctor);
  },

  create: async (doctorData: NewDoctor): Promise<Result<Doctor, string>> => {
    if (doctorData.specialtyId) {
      const specialty = await specialtyRepository.findById(doctorData.specialtyId);
      if (!specialty) {
        return createError('Specialty not found');
      }
    }

    const existingCrm = await doctorRepository.findByCrm(doctorData.crm);
    if (existingCrm) {
      return createError('CRM already registered');
    }

    const doctorId = await doctorRepository.create(doctorData);
    const doctor = await doctorRepository.findById(doctorId);

    if (!doctor) {
      return createError('Failed to create doctor');
    }

    return createSuccess(doctor);
  },

  update: async (id: number, doctorData: Partial<NewDoctor>): Promise<Result<Doctor, string>> => {
    const existing = await doctorRepository.findById(id);

    if (!existing) {
      return createError('Doctor not found');
    }

    if (doctorData.crm && doctorData.crm !== existing.crm) {
      const existingCrm = await doctorRepository.findByCrm(doctorData.crm);
      if (existingCrm) {
        return createError('CRM already registered');
      }
    }

    if (doctorData.specialtyId) {
      const specialty = await specialtyRepository.findById(doctorData.specialtyId);
      if (!specialty) {
        return createError('Specialty not found');
      }
    }

    await doctorRepository.update(id, doctorData);
    const updated = await doctorRepository.findById(id);

    if (!updated) {
      return createError('Failed to update doctor');
    }

    return createSuccess(updated);
  },

  delete: async (id: number): Promise<Result<void, string>> => {
    const existing = await doctorRepository.findById(id);

    if (!existing) {
      return createError('Doctor not found');
    }

    await doctorRepository.delete(id);
    return createSuccess(undefined);
  },
});

export type DoctorService = ReturnType<typeof createDoctorService>;
