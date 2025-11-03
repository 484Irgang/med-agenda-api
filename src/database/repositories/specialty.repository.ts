import { Database, getRow, getAllRows, runQuery } from '../connection';
import { Specialty, NewSpecialty } from '../../types/entities';

type SpecialtyRow = {
  id: number;
  name: string;
};

const mapRowToSpecialty = (row: SpecialtyRow): Specialty => ({
  id: row.id,
  name: row.name,
});

export const createSpecialtyRepository = (db: Database) => {
  const get = getRow<SpecialtyRow>(db);
  const getAll = getAllRows<SpecialtyRow>(db);
  const run = runQuery(db);

  return {
    findById: async (id: number): Promise<Specialty | undefined> => {
      const row = await get('SELECT * FROM specialties WHERE id = ?', [id]);
      return row ? mapRowToSpecialty(row) : undefined;
    },

    findAll: async (): Promise<Specialty[]> => {
      const rows = await getAll('SELECT * FROM specialties');
      return rows.map(mapRowToSpecialty);
    },

    findByName: async (name: string): Promise<Specialty | undefined> => {
      const row = await get('SELECT * FROM specialties WHERE name = ?', [name]);
      return row ? mapRowToSpecialty(row) : undefined;
    },

    create: async (specialty: NewSpecialty): Promise<number> => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO specialties (name) VALUES (?)',
          [specialty.name],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    },

    update: async (id: number, specialty: NewSpecialty): Promise<void> => {
      await run('UPDATE specialties SET name = ? WHERE id = ?', [specialty.name, id]);
    },

    delete: async (id: number): Promise<void> => {
      await run('DELETE FROM specialties WHERE id = ?', [id]);
    },
  };
};

export type SpecialtyRepository = ReturnType<typeof createSpecialtyRepository>;
