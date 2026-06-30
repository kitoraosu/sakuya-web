import { query } from './db.js';
import { MYSQL_CONFIGURED } from './config.js';
import type { MostPlayed, PlayerScore } from './types.js';

const VALID_MODES = new Set([0, 1, 2, 3, 4, 5, 6, 8]);
const clampMode = (m: number): number => (VALID_MODES.has(m) ? m : 0);
const clampLimit = (n: number): number =>
  Number.isFinite(n) ? Math.min(Math.max(Math.trunc(n), 1), 50) : 10;

// Поля карты для join
const MAP_COLS = `m.id AS m_id, m.set_id AS m_set_id, m.title AS m_title,
  m.artist AS m_artist, m.version AS m_version, m.creator AS m_creator, m.diff AS m_stars`;

interface ScoreRow {
  id: number;
  pp: number;
  score: number;
  acc: number;
  mods: number;
  max_combo: number;
  grade: string;
  n300: number;
  n100: number;
  n50: number;
  nmiss: number;
  perfect: number;
  play_time: string;
  m_id: number;
  m_set_id: number;
  m_title: string;
  m_artist: string;
  m_version: string;
  m_creator: string;
  m_stars: number;
}

function mapScoreRow(r: ScoreRow): PlayerScore {
  return {
    id: r.id,
    pp: r.pp,
    score: r.score,
    acc: r.acc,
    mods: r.mods,
    max_combo: r.max_combo,
    grade: r.grade,
    n300: r.n300,
    n100: r.n100,
    n50: r.n50,
    nmiss: r.nmiss,
    perfect: r.perfect,
    play_time: r.play_time,
    map: {
      id: r.m_id,
      set_id: r.m_set_id,
      title: r.m_title,
      artist: r.m_artist,
      version: r.m_version,
      creator: r.m_creator,
      stars: r.m_stars,
    },
  };
}

// type: 'best' (status=2, по pp) | 'recent' (любые, по времени)
export async function getScores(
  userId: number,
  modeRaw: number,
  type: 'best' | 'recent',
  limitRaw: number,
): Promise<PlayerScore[]> {
  if (!MYSQL_CONFIGURED) return [];
  const mode = clampMode(modeRaw);
  const limit = clampLimit(limitRaw);

  const where =
    type === 'best'
      ? 's.userid = ? AND s.mode = ? AND s.status = 2'
      : 's.userid = ? AND s.mode = ?';
  const order = type === 'best' ? 's.pp DESC' : 's.play_time DESC';

  const rows = await query<ScoreRow>(
    `SELECT s.id, s.pp, s.score, s.acc, s.mods, s.max_combo, s.grade,
            s.n300, s.n100, s.n50, s.nmiss, s.perfect, s.play_time, ${MAP_COLS}
       FROM scores s
       JOIN maps m ON m.md5 = s.map_md5
      WHERE ${where}
      ORDER BY ${order}
      LIMIT ${limit}`,
    [userId, mode],
  );
  return rows.map(mapScoreRow);
}

export async function getMostPlayed(
  userId: number,
  modeRaw: number,
  limitRaw: number,
): Promise<MostPlayed[]> {
  if (!MYSQL_CONFIGURED) return [];
  const mode = clampMode(modeRaw);
  const limit = clampLimit(limitRaw);

  const rows = await query<{
    playcount: number;
    m_id: number;
    m_set_id: number;
    m_title: string;
    m_artist: string;
    m_version: string;
    m_creator: string;
    m_stars: number;
  }>(
    `SELECT COUNT(*) AS playcount, ${MAP_COLS}
       FROM scores s
       JOIN maps m ON m.md5 = s.map_md5
      WHERE s.userid = ? AND s.mode = ?
      GROUP BY s.map_md5
      ORDER BY playcount DESC
      LIMIT ${limit}`,
    [userId, mode],
  );
  return rows.map((r) => ({
    playcount: r.playcount,
    map: {
      id: r.m_id,
      set_id: r.m_set_id,
      title: r.m_title,
      artist: r.m_artist,
      version: r.m_version,
      creator: r.m_creator,
      stars: r.m_stars,
    },
  }));
}
