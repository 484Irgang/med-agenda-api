import { Database, getRow, getAllRows, runQuery } from '../connection';
import { Doctor, NewDoctor, Specialty } from '../../types/entities';

type DoctorRow = {
  id: number;
  name: string;
  crm: string;
  email: string;
  phone: string;
  specialty_id: number | null;
};

type DoctorWithSpecialtyRow = DoctorRow & {
  specialty_name?: string;
};

const mapRowToDoctor = (row: DoctorRow, specialty?: Specialty): Doctor => ({
  id: row.id,
  name: row.name,
  crm: row.crm,
  email: row.email,
  phone: row.phone,
  specialtyId: row.specialty_id,
  specialty,
});

const mapRowToDoctorWithSpecialty = (row: DoctorWithSpecialtyRow): Doctor => {
  const specialty = row.specialty_id && row.specialty_name
    ? { id: row.specialty_id, name: row.specialty_name }
    : undefined;

  return mapRowToDoctor(row, specialty);
};

export const createDoctorRepository = (db: Database) => {
  const get = getRow<DoctorWithSpecialtyRow>(db);
  const getAll = getAllRows<DoctorWithSpecialtyRow>(db);
  const run = runQuery(db);

  return {
    findById: async (id: number): Promise<Doctor | undefined> => {
      const row = await get(
        `SELECT d.*, s.name as specialty_name
         FROM doctors d
         LEFT JOIN specialties s ON d.specialty_id = s.id
         WHERE d.id = ?`,
        [id]
      );
      return row ? mapRowToDoctorWithSpecialty(row) : undefined;
    },

    findAll: async (): Promise<Doctor[]> => {
      const rows = await getAll(
        `SELECT d.*, s.name as specialty_name
         FROM doctors d
         LEFT JOIN specialties s ON d.specialty_id = s.id`
      );
      return rows.map(mapRowToDoctorWithSpecialty);
    },

    findByCrm: async (crm: string): Promise<Doctor | undefined> => {
      const row = await get(
        `SELECT d.*, s.name as specialty_name
         FROM doctors d
         LEFT JOIN specialties s ON d.specialty_id = s.id
         WHERE d.crm = ?`,
        [crm]
      );
      return row ? mapRowToDoctorWithSpecialty(row) : undefined;
    },

    create: async (doctor: NewDoctor): Promise<number> => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO doctors (name, crm, email, phone, specialty_id) VALUES (?, ?, ?, ?, ?)',
          [doctor.name, doctor.crm, doctor.email, doctor.phone, doctor.specialtyId],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    },

    update: async (id: number, doctor: Partial<NewDoctor>): Promise<void> => {
      const fields: string[] = [];
      const values: unknown[] = [];

      if (doctor.name !== undefined) {
        fields.push('name = ?');
        values.push(doctor.name);
      }
      if (doctor.crm !== undefined) {
        fields.push('crm = ?');
        values.push(doctor.crm);
      }
      if (doctor.email !== undefined) {
        fields.push('email = ?');
        values.push(doctor.email);
      }
      if (doctor.phone !== undefined) {
        fields.push('phone = ?');
        values.push(doctor.phone);
      }
      if (doctor.specialtyId !== undefined) {
        fields.push('specialty_id = ?');
        values.push(doctor.specialtyId);
      }

      if (fields.length === 0) return;

      values.push(id);
      await run(`UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`, values);
    },

    delete: async (id: number): Promise<void> => {
      await run('DELETE FROM doctors WHERE id = ?', [id]);
    },
  };
};

export type DoctorRepository = ReturnType<typeof createDoctorRepository>;
