import dotenv from 'dotenv';

dotenv.config();

export const MYSQL_CONFIGURED = Boolean(
  process.env.MYSQL_USER && process.env.MYSQL_DATABASE,
);

export const config = {
  port: Number(process.env.SERVER_PORT) || 11002,
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  hcaptchaSecret: process.env.HCAPTCHA_SECRET || '',
  // Аватары bancho.py (docker volume) и баннеры профиля (папка проекта)
  avatarsDir:
    process.env.AVATARS_DIR ||
    '/var/lib/docker/volumes/banchopy_data/_data/avatars',
  bannersDir: process.env.BANNERS_DIR || new URL('../uploads/banners', import.meta.url).pathname,
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || '',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || '',
  },
};
