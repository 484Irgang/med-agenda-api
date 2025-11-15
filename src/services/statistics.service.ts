import { Database } from 'sqlite3';
import { createSuccess, createError, Result } from '../types/http';
import dayjs from 'dayjs';

export type PatientStatistics = {
  consultasRealizadas: number;
  consultasAgendadas: number;
  medicosConsultados: number;
  avaliacoesFeitas: number;
  especialidadesConsultadas: {
    nome: string;
    quantidade: number;
  }[];
  ultimaConsulta?: {
    medicoNome: string;
    especialidade: string;
    data: string;
    avaliacao: number;
  };
};

export type DoctorStatistics = {
  consultasEsteMes: number;
  pacientesAtendidos: number;
  avaliacaoMedia: number;
  proximasConsultas: number;
  avaliacoesRecentes: {
    pacienteNome: string;
    data: string;
    avaliacao: number;
    comentario: string;
  }[];
  distribuicaoHorarios: {
    manha: number;
    tarde: number;
    noite: number;
  };
};

export const createStatisticsService = (db: Database) => {
  const getPatientStatistics = async (patientId: number): Promise<Result<PatientStatistics, string>> => {
    return new Promise((resolve) => {
      const now = dayjs();
      const stats: PatientStatistics = {
        consultasRealizadas: 0,
        consultasAgendadas: 0,
        medicosConsultados: 0,
        avaliacoesFeitas: 0,
        especialidadesConsultadas: [],
      };

      db.get(
        `SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND date_time < ?`,
        [patientId, now.toISOString()],
        (err, row: any) => {
          if (err) {
            resolve(createError('Error fetching patient statistics'));
            return;
          }
          stats.consultasRealizadas = row.count;

          db.get(
            `SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND date_time >= ?`,
            [patientId, now.toISOString()],
            (err, row: any) => {
              if (err) {
                resolve(createError('Error fetching patient statistics'));
                return;
              }
              stats.consultasAgendadas = row.count;

              db.get(
                `SELECT COUNT(DISTINCT doctor_id) as count FROM appointments WHERE patient_id = ?`,
                [patientId],
                (err, row: any) => {
                  if (err) {
                    resolve(createError('Error fetching patient statistics'));
                    return;
                  }
                  stats.medicosConsultados = row.count;

                  db.get(
                    `SELECT COUNT(*) as count FROM feedbacks WHERE patient_id = ?`,
                    [patientId],
                    (err, row: any) => {
                      if (err) {
                        resolve(createError('Error fetching patient statistics'));
                        return;
                      }
                      stats.avaliacoesFeitas = row.count;

                      db.all(
                        `SELECT s.name, COUNT(*) as quantidade
                         FROM appointments a
                         JOIN doctors d ON a.doctor_id = d.id
                         JOIN specialties s ON d.specialty_id = s.id
                         WHERE a.patient_id = ?
                         GROUP BY s.id, s.name
                         ORDER BY quantidade DESC`,
                        [patientId],
                        (err, rows: any[]) => {
                          if (err) {
                            resolve(createError('Error fetching patient statistics'));
                            return;
                          }
                          stats.especialidadesConsultadas = rows.map(r => ({
                            nome: r.name,
                            quantidade: r.quantidade,
                          }));

                          db.get(
                            `SELECT
                               u.name as medicoNome,
                               s.name as especialidade,
                               a.date_time as data,
                               COALESCE(f.rating, 0) as avaliacao
                             FROM appointments a
                             JOIN doctors d ON a.doctor_id = d.id
                             JOIN users u ON u.doctor_id = d.id
                             JOIN specialties s ON d.specialty_id = s.id
                             LEFT JOIN feedbacks f ON f.appointment_id = a.id
                             WHERE a.patient_id = ? AND a.date_time < ?
                             ORDER BY a.date_time DESC
                             LIMIT 1`,
                            [patientId, now.toISOString()],
                            (err, row: any) => {
                              if (err) {
                                resolve(createError('Error fetching patient statistics'));
                                return;
                              }
                              if (row) {
                                stats.ultimaConsulta = {
                                  medicoNome: row.medicoNome,
                                  especialidade: row.especialidade,
                                  data: dayjs(row.data).format('DD [de] MMMM, YYYY'),
                                  avaliacao: row.avaliacao,
                                };
                              }
                              resolve(createSuccess(stats));
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  };

  const getDoctorStatistics = async (doctorId: number): Promise<Result<DoctorStatistics, string>> => {
    return new Promise((resolve) => {
      const now = dayjs();
      const startOfMonth = now.startOf('month').toISOString();
      const stats: DoctorStatistics = {
        consultasEsteMes: 0,
        pacientesAtendidos: 0,
        avaliacaoMedia: 0,
        proximasConsultas: 0,
        avaliacoesRecentes: [],
        distribuicaoHorarios: {
          manha: 0,
          tarde: 0,
          noite: 0,
        },
      };

      db.get(
        `SELECT COUNT(*) as count FROM appointments
         WHERE doctor_id = ? AND date_time >= ? AND date_time <= ?`,
        [doctorId, startOfMonth, now.toISOString()],
        (err, row: any) => {
          if (err) {
            resolve(createError('Error fetching doctor statistics'));
            return;
          }
          stats.consultasEsteMes = row.count;

          db.get(
            `SELECT COUNT(DISTINCT patient_id) as count FROM appointments WHERE doctor_id = ?`,
            [doctorId],
            (err, row: any) => {
              if (err) {
                resolve(createError('Error fetching doctor statistics'));
                return;
              }
              stats.pacientesAtendidos = row.count;

              db.get(
                `SELECT AVG(f.rating) as avg FROM feedbacks f
                 JOIN appointments a ON f.appointment_id = a.id
                 WHERE a.doctor_id = ?`,
                [doctorId],
                (err, row: any) => {
                  if (err) {
                    resolve(createError('Error fetching doctor statistics'));
                    return;
                  }
                  stats.avaliacaoMedia = row.avg || 0;

                  db.get(
                    `SELECT COUNT(*) as count FROM appointments
                     WHERE doctor_id = ? AND date_time >= ?`,
                    [doctorId, now.toISOString()],
                    (err, row: any) => {
                      if (err) {
                        resolve(createError('Error fetching doctor statistics'));
                        return;
                      }
                      stats.proximasConsultas = row.count;

                      db.all(
                        `SELECT
                           u.name as pacienteNome,
                           f.created_at as data,
                           f.rating as avaliacao,
                           f.comment as comentario
                         FROM feedbacks f
                         JOIN appointments a ON f.appointment_id = a.id
                         JOIN patients p ON f.patient_id = p.id
                         JOIN users u ON u.patient_id = p.id
                         WHERE a.doctor_id = ?
                         ORDER BY f.created_at DESC
                         LIMIT 5`,
                        [doctorId],
                        (err, rows: any[]) => {
                          if (err) {
                            resolve(createError('Error fetching doctor statistics'));
                            return;
                          }
                          stats.avaliacoesRecentes = rows.map(r => ({
                            pacienteNome: r.pacienteNome,
                            data: dayjs(r.data).fromNow(),
                            avaliacao: r.avaliacao,
                            comentario: r.comentario || '',
                          }));

                          db.all(
                            `SELECT date_time FROM appointments WHERE doctor_id = ?`,
                            [doctorId],
                            (err, rows: any[]) => {
                              if (err) {
                                resolve(createError('Error fetching doctor statistics'));
                                return;
                              }

                              rows.forEach(row => {
                                const hour = dayjs(row.date_time).hour();
                                if (hour >= 8 && hour < 12) {
                                  stats.distribuicaoHorarios.manha++;
                                } else if (hour >= 13 && hour < 18) {
                                  stats.distribuicaoHorarios.tarde++;
                                } else if (hour >= 18 && hour < 21) {
                                  stats.distribuicaoHorarios.noite++;
                                }
                              });

                              resolve(createSuccess(stats));
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  };

  return {
    getPatientStatistics,
    getDoctorStatistics,
  };
};

export type StatisticsService = ReturnType<typeof createStatisticsService>;
