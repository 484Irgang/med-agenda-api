import { Database } from 'sqlite3';
import { createSuccess, createError, Result } from '../types/http';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

export type Notification = {
  id: number;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  tipo: 'consulta' | 'lembrete' | 'feedback' | 'sistema';
};

type NotificationRow = {
  id: number;
  user_id: number;
  titulo: string;
  mensagem: string;
  data: string;
  lida: number;
  tipo: 'consulta' | 'lembrete' | 'feedback' | 'sistema';
};

const mapNotification = (row: NotificationRow): Notification => ({
  id: row.id,
  titulo: row.titulo,
  mensagem: row.mensagem,
  data: dayjs(row.data).fromNow(),
  lida: row.lida === 1,
  tipo: row.tipo,
});

export const createNotificationService = (db: Database) => {
  const getByUserId = async (userId: number): Promise<Result<Notification[], string>> => {
    return new Promise((resolve) => {
      db.all(
        `SELECT * FROM notifications WHERE user_id = ? ORDER BY data DESC`,
        [userId],
        (err, rows: NotificationRow[]) => {
          if (err) {
            resolve(createError('Error fetching notifications'));
            return;
          }
          const notifications = rows.map(mapNotification);
          resolve(createSuccess(notifications));
        }
      );
    });
  };

  const markAsRead = async (notificationId: number): Promise<Result<void, string>> => {
    return new Promise((resolve) => {
      db.run(
        `UPDATE notifications SET lida = 1 WHERE id = ?`,
        [notificationId],
        function (err) {
          if (err) {
            resolve(createError('Error marking notification as read'));
            return;
          }
          if (this.changes === 0) {
            resolve(createError('Notification not found'));
            return;
          }
          resolve(createSuccess(undefined));
        }
      );
    });
  };

  const markAllAsRead = async (userId: number): Promise<Result<void, string>> => {
    return new Promise((resolve) => {
      db.run(
        `UPDATE notifications SET lida = 1 WHERE user_id = ?`,
        [userId],
        function (err) {
          if (err) {
            resolve(createError('Error marking notifications as read'));
            return;
          }
          resolve(createSuccess(undefined));
        }
      );
    });
  };

  const create = async (
    userId: number,
    titulo: string,
    mensagem: string,
    tipo: 'consulta' | 'lembrete' | 'feedback' | 'sistema'
  ): Promise<Result<Notification, string>> => {
    return new Promise((resolve) => {
      const now = dayjs().toISOString();
      db.run(
        `INSERT INTO notifications (user_id, titulo, mensagem, data, lida, tipo)
         VALUES (?, ?, ?, ?, 0, ?)`,
        [userId, titulo, mensagem, now, tipo],
        function (err) {
          if (err) {
            resolve(createError('Error creating notification'));
            return;
          }
          db.get(
            `SELECT * FROM notifications WHERE id = ?`,
            [this.lastID],
            (err, row: NotificationRow) => {
              if (err) {
                resolve(createError('Error fetching created notification'));
                return;
              }
              resolve(createSuccess(mapNotification(row)));
            }
          );
        }
      );
    });
  };

  return {
    getByUserId,
    markAsRead,
    markAllAsRead,
    create,
  };
};

export type NotificationService = ReturnType<typeof createNotificationService>;
