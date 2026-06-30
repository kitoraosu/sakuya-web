import { Router } from 'express';
import { getUserById, login, register, RegisterError } from '../auth.service.js';
import { verifyCaptcha } from '../hcaptcha.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }
  try {
    const result = await login(username, password);
    if (!result) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }
    res.json(result);
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register { username, email, password, captcha }
router.post('/register', async (req, res) => {
  const { username, email, password, captcha } = req.body ?? {};
  if (
    typeof username !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    res.status(400).json({ error: 'username, email and password are required' });
    return;
  }

  const ok = await verifyCaptcha(typeof captcha === 'string' ? captcha : '', req.ip);
  if (!ok) {
    res.status(400).json({ error: 'Captcha verification failed' });
    return;
  }

  try {
    const result = await register(username, email, password);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof RegisterError) {
      res.status(400).json({ error: 'Validation failed', fields: err.errors });
      return;
    }
    console.error('[auth/register]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await getUserById(req.auth!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (err) {
    console.error('[auth/me]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
