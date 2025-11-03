import { Database, getRow, getAllRows, runQuery } from '../connection';
import { Patient, NewPatient } from '../../types/entities';

type PatientRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  birth_date: string;
};

const mapRowToPatient = (row: PatientRow): Patient => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  birthDate: new Date(row.birth_date),
});

export const createPatientRepository = (db: Database) => {
  const get = getRow<PatientRow>(db);
  const getAll = getAllRows<PatientRow>(db);
  const run = runQuery(db);

  return {
    findById: async (id: number): Promise<Patient | undefined> => {
      const row = await get('SELECT * FROM patients WHERE id = ?', [id]);
      return row ? mapRowToPatient(row) : undefined;
    },

    findAll: async (): Promise<Patient[]> => {
      const rows = await getAll('SELECT * FROM patients');
      return rows.map(mapRowToPatient);
    },

    create: async (patient: NewPatient): Promise<number> => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO patients (name, email, phone, birth_date) VALUES (?, ?, ?, ?)',
          [patient.name, patient.email, patient.phone, patient.birthDate.toISOString()],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    },

    update: async (id: number, patient: Partial<NewPatient>): Promise<void> => {
      const fields: string[] = [];
      const values: unknown[] = [];

      if (patient.name !== undefined) {
        fields.push('name = ?');
        values.push(patient.name);
      }
      if (patient.email !== undefined) {
        fields.push('email = ?');
        values.push(patient.email);
      }
      if (patient.phone !== undefined) {
        fields.push('phone = ?');
        values.push(patient.phone);
      }
      if (patient.birthDate !== undefined) {
        fields.push('birth_date = ?');
        values.push(patient.birthDate.toISOString());
      }

      if (fields.length === 0) return;

      values.push(id);
      await run(`UPDATE patients SET ${fields.join(', ')} WHERE id = ?`, values);
    },

    delete: async (id: number): Promise<void> => {
      await run('DELETE FROM patients WHERE id = ?', [id]);
    },
  };
};

export type PatientRepository = ReturnType<typeof createPatientRepository>;
