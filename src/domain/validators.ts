import { z } from 'zod';
import { UserType } from '../types/entities';

export const userSchema = z.object({
  name: z.string().nullable().default(null),
  email: z.string().email(),
  password: z.string().min(6),
  type: z.nativeEnum(UserType),
});

export const patientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  birthDate: z.coerce.date(),
});

export const doctorSchema = z.object({
  name: z.string().min(1),
  crm: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  specialtyId: z.number().int().positive().nullable(),
});

export const specialtySchema = z.object({
  name: z.string().min(1),
});

export const appointmentSchema = z.object({
  patientId: z.number().int().positive().nullable(),
  doctorId: z.number().int().positive().nullable(),
  specialtyId: z.number().int().positive(),
  dateTime: z.coerce.date(),
  status: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: z.ZodIssue[] };

export const validate = <T>(schema: z.ZodSchema<T>) => (data: unknown): ValidationResult<T> => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error.issues };
  }
};
