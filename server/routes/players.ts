import { Router } from 'express';
import { getLeaderboard, getPlayerProfile } from '../stats.service.js';
import { getMostPlayed, getScores } from '../scores.service.js';
import { hasBanner } from '../me.service.js';

const router = Router();

router.get('/leaderboard', async (req, res) => {
  const mode = Number(req.query.mode ?? 0);
  const limit = Number(req.query.limit ?? 50);
  try {
    const entries = await getLeaderboard(mode, limit);
    res.json({ mode, entries });
  } catch (err) {
    console.error('[leaderboard]', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

router.get('/players/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    const profile = await getPlayerProfile(id);
    if (!profile) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }
    res.json({ profile: { ...profile, has_banner: await hasBanner(id) } });
  } catch (err) {
    console.error('[players/:id]', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

router.get('/players/:id/scores', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const mode = Number(req.query.mode ?? 0);
  const limit = Number(req.query.limit ?? 10);
  const type = req.query.type === 'recent' ? 'recent' : 'best';
  try {
    const scores = await getScores(id, mode, type, limit);
    res.json({ scores });
  } catch (err) {
    console.error('[players/:id/scores]', err);
    res.status(500).json({ error: 'Failed to load scores' });
  }
});

router.get('/players/:id/most-played', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const mode = Number(req.query.mode ?? 0);
  const limit = Number(req.query.limit ?? 10);
  try {
    const maps = await getMostPlayed(id, mode, limit);
    res.json({ maps });
  } catch (err) {
    console.error('[players/:id/most-played]', err);
    res.status(500).json({ error: 'Failed to load most played' });
  }
});

export default router;
