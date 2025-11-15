import { Database, runQuery, createDatabase as createDatabaseConnection } from './connection';

export { createDatabaseConnection as createDatabase };

const createTables = async (db: Database): Promise<void> => {
  const run = runQuery(db);

  await run(`
    CREATE TABLE IF NOT EXISTS specialties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      birth_date TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      crm TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      specialty_id INTEGER,
      FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('PATIENT', 'DOCTOR')),
      patient_id INTEGER,
      doctor_id INTEGER,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      doctor_id INTEGER,
      specialty_id INTEGER NOT NULL,
      date_time TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
      FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      data TEXT NOT NULL,
      lida INTEGER NOT NULL DEFAULT 0,
      tipo TEXT NOT NULL CHECK(tipo IN ('consulta', 'lembrete', 'feedback', 'sistema')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_doctors_crm ON doctors(crm)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_appointments_specialty ON appointments(specialty_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_feedbacks_appointment ON feedbacks(appointment_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);
};

export const initializeDatabase = async (db: Database): Promise<void> => {
  await createTables(db);
};
