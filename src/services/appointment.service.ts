import { AppointmentRepository } from '../database/repositories/appointment.repository';
import { PatientRepository } from '../database/repositories/patient.repository';
import { DoctorRepository } from '../database/repositories/doctor.repository';
import { SpecialtyRepository } from '../database/repositories/specialty.repository';
import { NewAppointment, Appointment } from '../types/entities';
import { Result, createSuccess, createError } from '../types/http';

export const createAppointmentService = (
  appointmentRepository: AppointmentRepository,
  patientRepository: PatientRepository,
  doctorRepository: DoctorRepository,
  specialtyRepository: SpecialtyRepository
) => ({
  getAll: async (): Promise<Result<Appointment[], string>> => {
    const appointments = await appointmentRepository.findAll();
    return createSuccess(appointments);
  },

  getById: async (id: number): Promise<Result<Appointment, string>> => {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      return createError('Appointment not found');
    }

    return createSuccess(appointment);
  },

  getByPatientId: async (patientId: number): Promise<Result<Appointment[], string>> => {
    const patient = await patientRepository.findById(patientId);

    if (!patient) {
      return createError('Patient not found');
    }

    const appointments = await appointmentRepository.findByPatientId(patientId);
    return createSuccess(appointments);
  },

  getByDoctorId: async (doctorId: number): Promise<Result<Appointment[], string>> => {
    const doctor = await doctorRepository.findById(doctorId);

    if (!doctor) {
      return createError('Doctor not found');
    }

    const appointments = await appointmentRepository.findByDoctorId(doctorId);
    return createSuccess(appointments);
  },

  create: async (appointmentData: NewAppointment): Promise<Result<Appointment, string>> => {
    if (appointmentData.patientId) {
      const patient = await patientRepository.findById(appointmentData.patientId);
      if (!patient) {
        return createError('Patient not found');
      }
    }

    if (appointmentData.doctorId) {
      const doctor = await doctorRepository.findById(appointmentData.doctorId);
      if (!doctor) {
        return createError('Doctor not found');
      }
    }

    const specialty = await specialtyRepository.findById(appointmentData.specialtyId);
    if (!specialty) {
      return createError('Specialty not found');
    }

    const appointmentId = await appointmentRepository.create(appointmentData);
    const appointment = await appointmentRepository.findById(appointmentId);

    if (!appointment) {
      return createError('Failed to create appointment');
    }

    return createSuccess(appointment);
  },

  update: async (
    id: number,
    appointmentData: Partial<NewAppointment>
  ): Promise<Result<Appointment, string>> => {
    const existing = await appointmentRepository.findById(id);

    if (!existing) {
      return createError('Appointment not found');
    }

    if (appointmentData.patientId) {
      const patient = await patientRepository.findById(appointmentData.patientId);
      if (!patient) {
        return createError('Patient not found');
      }
    }

    if (appointmentData.doctorId) {
      const doctor = await doctorRepository.findById(appointmentData.doctorId);
      if (!doctor) {
        return createError('Doctor not found');
      }
    }

    if (appointmentData.specialtyId) {
      const specialty = await specialtyRepository.findById(appointmentData.specialtyId);
      if (!specialty) {
        return createError('Specialty not found');
      }
    }

    await appointmentRepository.update(id, appointmentData);
    const updated = await appointmentRepository.findById(id);

    if (!updated) {
      return createError('Failed to update appointment');
    }

    return createSuccess(updated);
  },

  delete: async (id: number): Promise<Result<void, string>> => {
    const existing = await appointmentRepository.findById(id);

    if (!existing) {
      return createError('Appointment not found');
    }

    await appointmentRepository.delete(id);
    return createSuccess(undefined);
  },
});

export type AppointmentService = ReturnType<typeof createAppointmentService>;
