import { query } from './db.js';
import { MYSQL_CONFIGURED } from './config.js';
import type { LeaderboardEntry, ModeStats, PlayerProfile } from './types.js';

// Допустимые игровые режимы bancho.py (vn 0-3, rx 4-6, ap 8)
const VALID_MODES = new Set([0, 1, 2, 3, 4, 5, 6, 8]);

function clampMode(mode: number): number {
  return VALID_MODES.has(mode) ? mode : 0;
}

function clampLimit(limit: number): number {
  if (!Number.isFinite(limit)) return 50;
  return Math.min(Math.max(Math.trunc(limit), 1), 100);
}

// Таблица лидеров по pp для выбранного режима.
// Исключаем BanchoBot (id=1) и ограниченных юзеров (нужен бит priv & 1).
export async function getLeaderboard(modeRaw: number, limitRaw: number): Promise<LeaderboardEntry[]> {
  if (!MYSQL_CONFIGURED) return [];
  const mode = clampMode(modeRaw);
  const limit = clampLimit(limitRaw);

  // mode и limit уже провалидированы как числа -> безопасно встроить
  const rows = await query<{
    id: number;
    name: string;
    country: string;
    pp: number;
    rscore: number;
    acc: number;
    plays: number;
  }>(
    `SELECT u.id, u.name, u.country, s.pp, s.rscore, s.acc, s.plays
       FROM stats s
       JOIN users u ON u.id = s.id
      WHERE s.mode = ${mode}
        AND u.id != 1
        AND (u.priv & 1) = 1
      ORDER BY s.pp DESC, s.rscore DESC
      LIMIT ${limit}`,
  );

  return rows.map((r, i) => ({ rank: i + 1, ...r }));
}

export async function getPlayerProfile(id: number): Promise<PlayerProfile | null> {
  if (!MYSQL_CONFIGURED) return null;

  const users = await query<{
    id: number;
    name: string;
    country: string;
    priv: number;
    creation_time: number;
    latest_activity: number;
  }>(
    'SELECT id, name, country, priv, creation_time, latest_activity FROM users WHERE id = ? AND id != 1 LIMIT 1',
    [id],
  );
  const user = users[0];
  if (!user) return null;

  const stats = await query<ModeStats>(
    `SELECT mode, tscore, rscore, pp, plays, playtime, acc, max_combo, total_hits,
            xh_count, x_count, sh_count, s_count, a_count
       FROM stats WHERE id = ? ORDER BY mode`,
    [id],
  );

  return { ...user, stats };
}
