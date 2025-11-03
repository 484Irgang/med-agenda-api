import sqlite3 from 'sqlite3';
import { env } from '../config/environment';

export type Database = sqlite3.Database;

export const createDatabase = (): Promise<Database> =>
  new Promise((resolve, reject) => {
    const db = new sqlite3.Database(env.DATABASE_PATH, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });

export const runQuery = (db: Database) => (sql: string, params: unknown[] = []): Promise<void> =>
  new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

export const getRow = <T>(db: Database) => (sql: string, params: unknown[] = []): Promise<T | undefined> =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });

export const getAllRows = <T>(db: Database) => (sql: string, params: unknown[] = []): Promise<T[]> =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });

export const closeDatabase = (db: Database): Promise<void> =>
  new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
