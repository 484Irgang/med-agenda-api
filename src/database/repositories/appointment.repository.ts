import { Database, getRow, getAllRows, runQuery } from '../connection';
import { Appointment, NewAppointment } from '../../types/entities';

type AppointmentRow = {
  id: number;
  patient_id: number | null;
  doctor_id: number | null;
  specialty_id: number;
  date_time: string;
  status: string;
};

type AppointmentWithDetailsRow = AppointmentRow & {
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  patient_birth_date?: string;
  doctor_name?: string;
  doctor_crm?: string;
  doctor_email?: string;
  doctor_phone?: string;
  specialty_name?: string;
};

const mapRowToAppointment = (row: AppointmentRow): Appointment => ({
  id: row.id,
  patientId: row.patient_id,
  doctorId: row.doctor_id,
  specialtyId: row.specialty_id,
  dateTime: new Date(row.date_time),
  status: row.status,
});

const mapRowToAppointmentWithDetails = (row: AppointmentWithDetailsRow): Appointment => {
  const appointment = mapRowToAppointment(row);

  if (row.patient_id && row.patient_name) {
    appointment.patient = {
      id: row.patient_id,
      name: row.patient_name,
      email: row.patient_email!,
      phone: row.patient_phone!,
      birthDate: new Date(row.patient_birth_date!),
    };
  }

  if (row.doctor_id && row.doctor_name) {
    appointment.doctor = {
      id: row.doctor_id,
      name: row.doctor_name,
      crm: row.doctor_crm!,
      email: row.doctor_email!,
      phone: row.doctor_phone!,
      specialtyId: row.specialty_id,
    };
  }

  if (row.specialty_name) {
    appointment.specialty = {
      id: row.specialty_id,
      name: row.specialty_name,
    };
  }

  return appointment;
};

export const createAppointmentRepository = (db: Database) => {
  const get = getRow<AppointmentWithDetailsRow>(db);
  const getAll = getAllRows<AppointmentWithDetailsRow>(db);
  const run = runQuery(db);

  const baseQuery = `
    SELECT
      a.*,
      p.name as patient_name,
      p.email as patient_email,
      p.phone as patient_phone,
      p.birth_date as patient_birth_date,
      d.name as doctor_name,
      d.crm as doctor_crm,
      d.email as doctor_email,
      d.phone as doctor_phone,
      s.name as specialty_name
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN doctors d ON a.doctor_id = d.id
    LEFT JOIN specialties s ON a.specialty_id = s.id
  `;

  return {
    findById: async (id: number): Promise<Appointment | undefined> => {
      const row = await get(`${baseQuery} WHERE a.id = ?`, [id]);
      return row ? mapRowToAppointmentWithDetails(row) : undefined;
    },

    findAll: async (): Promise<Appointment[]> => {
      const rows = await getAll(baseQuery);
      return rows.map(mapRowToAppointmentWithDetails);
    },

    findByPatientId: async (patientId: number): Promise<Appointment[]> => {
      const rows = await getAll(`${baseQuery} WHERE a.patient_id = ?`, [patientId]);
      return rows.map(mapRowToAppointmentWithDetails);
    },

    findByDoctorId: async (doctorId: number): Promise<Appointment[]> => {
      const rows = await getAll(`${baseQuery} WHERE a.doctor_id = ?`, [doctorId]);
      return rows.map(mapRowToAppointmentWithDetails);
    },

    create: async (appointment: NewAppointment): Promise<number> => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO appointments (patient_id, doctor_id, specialty_id, date_time, status) VALUES (?, ?, ?, ?, ?)',
          [
            appointment.patientId,
            appointment.doctorId,
            appointment.specialtyId,
            appointment.dateTime.toISOString(),
            appointment.status,
          ],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    },

    update: async (id: number, appointment: Partial<NewAppointment>): Promise<void> => {
      const fields: string[] = [];
      const values: unknown[] = [];

      if (appointment.patientId !== undefined) {
        fields.push('patient_id = ?');
        values.push(appointment.patientId);
      }
      if (appointment.doctorId !== undefined) {
        fields.push('doctor_id = ?');
        values.push(appointment.doctorId);
      }
      if (appointment.specialtyId !== undefined) {
        fields.push('specialty_id = ?');
        values.push(appointment.specialtyId);
      }
      if (appointment.dateTime !== undefined) {
        fields.push('date_time = ?');
        values.push(appointment.dateTime.toISOString());
      }
      if (appointment.status !== undefined) {
        fields.push('status = ?');
        values.push(appointment.status);
      }

      if (fields.length === 0) return;

      values.push(id);
      await run(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`, values);
    },

    delete: async (id: number): Promise<void> => {
      await run('DELETE FROM appointments WHERE id = ?', [id]);
    },
  };
};

export type AppointmentRepository = ReturnType<typeof createAppointmentRepository>;
