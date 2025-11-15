import { Database, getRow, getAllRows, runQuery } from '../connection';
import { Feedback, NewFeedback } from '../../types/entities';

type FeedbackRow = {
  id: number;
  appointment_id: number;
  patient_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
};

const mapRowToFeedback = (row: FeedbackRow): Feedback => ({
  id: row.id,
  appointmentId: row.appointment_id,
  patientId: row.patient_id,
  rating: row.rating,
  comment: row.comment,
  createdAt: new Date(row.created_at),
});

export const createFeedbackRepository = (db: Database) => {
  const get = getRow<FeedbackRow>(db);
  const getAll = getAllRows<FeedbackRow>(db);
  const run = runQuery(db);

  return {
    findById: async (id: number): Promise<Feedback | undefined> => {
      const row = await get('SELECT * FROM feedbacks WHERE id = ?', [id]);
      return row ? mapRowToFeedback(row) : undefined;
    },

    findByAppointmentId: async (appointmentId: number): Promise<Feedback | undefined> => {
      const row = await get('SELECT * FROM feedbacks WHERE appointment_id = ?', [appointmentId]);
      return row ? mapRowToFeedback(row) : undefined;
    },

    findByPatientId: async (patientId: number): Promise<Feedback[]> => {
      const rows = await getAll('SELECT * FROM feedbacks WHERE patient_id = ? ORDER BY created_at DESC', [patientId]);
      return rows.map(mapRowToFeedback);
    },

    create: async (feedback: NewFeedback): Promise<number> => {
      const createdAt = new Date().toISOString();
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO feedbacks (appointment_id, patient_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)',
          [feedback.appointmentId, feedback.patientId, feedback.rating, feedback.comment || null, createdAt],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    },

    update: async (id: number, feedback: Partial<NewFeedback>): Promise<void> => {
      const fields: string[] = [];
      const values: unknown[] = [];

      if (feedback.rating !== undefined) {
        fields.push('rating = ?');
        values.push(feedback.rating);
      }

      if (feedback.comment !== undefined) {
        fields.push('comment = ?');
        values.push(feedback.comment);
      }

      if (fields.length === 0) return;

      values.push(id);
      await run(`UPDATE feedbacks SET ${fields.join(', ')} WHERE id = ?`, values);
    },

    delete: async (id: number): Promise<void> => {
      await run('DELETE FROM feedbacks WHERE id = ?', [id]);
    },
  };
};

export type FeedbackRepository = ReturnType<typeof createFeedbackRepository>;
