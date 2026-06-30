import express from 'express';
import cors from 'cors';
import { config, MYSQL_CONFIGURED } from './config.js';
import authRouter from './routes/auth.js';
import playersRouter from './routes/players.js';
import meRouter from './routes/me.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: MYSQL_CONFIGURED ? 'configured' : 'mock' });
});

// баннеры профилей (загруженные через настройки)
app.use('/uploads/banners', express.static(config.bannersDir, { setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache') }));

app.use('/api/auth', authRouter);
app.use('/api/me', meRouter);
app.use('/api', playersRouter);

app.listen(config.port, () => {
  const mode = MYSQL_CONFIGURED ? 'MySQL' : 'MOCK (логин Sakuya / пароль sakuya)';
  console.log(`[server] http://localhost:${config.port}  | режим БД: ${mode}`);
});
