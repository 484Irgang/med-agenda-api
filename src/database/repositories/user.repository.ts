import { Database, getRow, getAllRows, runQuery } from '../connection';
import { User, NewUser, UserType } from '../../types/entities';

type UserRow = {
  id: number;
  name: string | null;
  email: string;
  password: string;
  type: string;
  patient_id: number | null;
  doctor_id: number | null;
};

const mapRowToUser = (row: UserRow): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  password: row.password,
  type: row.type as UserType,
  patientId: row.patient_id,
  doctorId: row.doctor_id,
});

export const createUserRepository = (db: Database) => {
  const get = getRow<UserRow>(db);
  const getAll = getAllRows<UserRow>(db);
  const run = runQuery(db);

  return {
    findByEmail: async (email: string): Promise<User | undefined> => {
      const row = await get('SELECT * FROM users WHERE email = ?', [email]);
      return row ? mapRowToUser(row) : undefined;
    },

    findById: async (id: number): Promise<User | undefined> => {
      const row = await get('SELECT * FROM users WHERE id = ?', [id]);
      return row ? mapRowToUser(row) : undefined;
    },

    findAll: async (): Promise<User[]> => {
      const rows = await getAll('SELECT * FROM users');
      return rows.map(mapRowToUser);
    },

    create: async (user: NewUser): Promise<number> => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (name, email, password, type, patient_id, doctor_id) VALUES (?, ?, ?, ?, ?, ?)',
          [user.name, user.email, user.password, user.type, null, null],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    },

    update: async (id: number, updates: Partial<User>): Promise<void> => {
      const fields: string[] = [];
      const values: unknown[] = [];

      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.email !== undefined) {
        fields.push('email = ?');
        values.push(updates.email);
      }
      if (updates.password !== undefined) {
        fields.push('password = ?');
        values.push(updates.password);
      }
      if (updates.patientId !== undefined) {
        fields.push('patient_id = ?');
        values.push(updates.patientId);
      }
      if (updates.doctorId !== undefined) {
        fields.push('doctor_id = ?');
        values.push(updates.doctorId);
      }

      if (fields.length === 0) return;

      values.push(id);
      await run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    },

    delete: async (id: number): Promise<void> => {
      await run('DELETE FROM users WHERE id = ?', [id]);
    },
  };
};

export type UserRepository = ReturnType<typeof createUserRepository>;
