import mysql from 'mysql2/promise';
import { config, MYSQL_CONFIGURED } from './config.js';

// Пул создаётся только когда БД реально сконфигурирована.
// Пока доступа к БД нет — pool === null, работаем в mock-режиме (см. routes/auth.ts).
const pool = MYSQL_CONFIGURED
  ? mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  : null;

export async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  if (!pool) throw new Error('MySQL pool is not configured');
  const [rows] = await pool.execute(sql, params as never[]);
  return rows as T[];
}

export default pool;
