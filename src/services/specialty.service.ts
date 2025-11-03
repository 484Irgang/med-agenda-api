import { SpecialtyRepository } from '../database/repositories/specialty.repository';
import { NewSpecialty, Specialty } from '../types/entities';
import { Result, createSuccess, createError } from '../types/http';

export const createSpecialtyService = (specialtyRepository: SpecialtyRepository) => ({
  getAll: async (): Promise<Result<Specialty[], string>> => {
    const specialties = await specialtyRepository.findAll();
    return createSuccess(specialties);
  },

  getById: async (id: number): Promise<Result<Specialty, string>> => {
    const specialty = await specialtyRepository.findById(id);

    if (!specialty) {
      return createError('Specialty not found');
    }

    return createSuccess(specialty);
  },

  create: async (specialtyData: NewSpecialty): Promise<Result<Specialty, string>> => {
    const existing = await specialtyRepository.findByName(specialtyData.name);

    if (existing) {
      return createError('Specialty already exists');
    }

    const specialtyId = await specialtyRepository.create(specialtyData);
    const specialty = await specialtyRepository.findById(specialtyId);

    if (!specialty) {
      return createError('Failed to create specialty');
    }

    return createSuccess(specialty);
  },

  update: async (id: number, specialtyData: NewSpecialty): Promise<Result<Specialty, string>> => {
    const existing = await specialtyRepository.findById(id);

    if (!existing) {
      return createError('Specialty not found');
    }

    const nameExists = await specialtyRepository.findByName(specialtyData.name);
    if (nameExists && nameExists.id !== id) {
      return createError('Specialty name already exists');
    }

    await specialtyRepository.update(id, specialtyData);
    const updated = await specialtyRepository.findById(id);

    if (!updated) {
      return createError('Failed to update specialty');
    }

    return createSuccess(updated);
  },

  delete: async (id: number): Promise<Result<void, string>> => {
    const existing = await specialtyRepository.findById(id);

    if (!existing) {
      return createError('Specialty not found');
    }

    await specialtyRepository.delete(id);
    return createSuccess(undefined);
  },
});

export type SpecialtyService = ReturnType<typeof createSpecialtyService>;
