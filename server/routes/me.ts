import { Router } from 'express';
import multer from 'multer';
import {
  changePassword,
  getMyAccount,
  PasswordError,
  saveAvatar,
  saveBanner,
} from '../me.service.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

// загрузка картинок в память, лимит 5 МБ, только изображения
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'));
  },
});

router.use(requireAuth);

// GET /api/me — данные своего аккаунта (включая email)
router.get('/', async (req: AuthedRequest, res) => {
  try {
    const account = await getMyAccount(req.auth!.id);
    if (!account) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ account });
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/me/password { currentPassword, newPassword }
router.patch('/password', async (req: AuthedRequest, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    res.status(400).json({ error: 'currentPassword and newPassword are required' });
    return;
  }
  try {
    await changePassword(req.auth!.id, currentPassword, newPassword);
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof PasswordError) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error('[me/password]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/me/avatar (multipart 'file')
router.put('/avatar', upload.single('file'), async (req: AuthedRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Image file is required' });
    return;
  }
  try {
    await saveAvatar(req.auth!.id, req.file.buffer);
    res.json({ ok: true });
  } catch (err) {
    console.error('[me/avatar]', err);
    res.status(500).json({ error: 'Failed to save avatar' });
  }
});

// PUT /api/me/banner (multipart 'file')
router.put('/banner', upload.single('file'), async (req: AuthedRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Image file is required' });
    return;
  }
  try {
    await saveBanner(req.auth!.id, req.file.buffer);
    res.json({ ok: true });
  } catch (err) {
    console.error('[me/banner]', err);
    res.status(500).json({ error: 'Failed to save banner' });
  }
});

export default router;
