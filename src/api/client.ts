// Тонкий клиент над fetch. Запросы идут на /api (vite/nginx проксируют на Express).
const TOKEN_KEY = 'sakuya_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string): void => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Error ${res.status}`, data?.fields);
  return data as T;
}

// загрузка файла (multipart) — без Content-Type, его проставит браузер
async function upload<T>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`/api${path}`, { method: 'PUT', headers: authHeaders(), body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Error ${res.status}`);
  return data as T;
}

export interface PublicUser {
  id: number;
  name: string;
  country: string;
  priv: number;
}

export interface MyAccount {
  id: number;
  name: string;
  email: string;
  country: string;
  priv: number;
  has_banner: boolean;
}

export interface ModeStats {
  mode: number;
  tscore: number;
  rscore: number;
  pp: number;
  plays: number;
  playtime: number;
  acc: number;
  max_combo: number;
  total_hits: number;
  xh_count: number;
  x_count: number;
  sh_count: number;
  s_count: number;
  a_count: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  name: string;
  country: string;
  pp: number;
  rscore: number;
  acc: number;
  plays: number;
}

export interface PlayerProfile {
  id: number;
  name: string;
  country: string;
  priv: number;
  creation_time: number;
  latest_activity: number;
  has_banner: boolean;
  stats: ModeStats[];
}

export interface ScoreMap {
  id: number;
  set_id: number;
  title: string;
  artist: string;
  version: string;
  creator: string;
  stars: number;
}

export interface PlayerScore {
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
  map: ScoreMap;
}

export interface MostPlayed {
  playcount: number;
  map: ScoreMap;
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; user: PublicUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (username: string, email: string, password: string, captcha: string) =>
    request<{ token: string; user: PublicUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, captcha }),
    }),
  me: () => request<{ user: PublicUser }>('/auth/me'),
  account: () => request<{ account: MyAccount }>('/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: true }>('/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  uploadAvatar: (file: File) => upload<{ ok: true }>('/me/avatar', file),
  uploadBanner: (file: File) => upload<{ ok: true }>('/me/banner', file),
  leaderboard: (mode: number) =>
    request<{ mode: number; entries: LeaderboardEntry[] }>(`/leaderboard?mode=${mode}`),
  player: (id: number) => request<{ profile: PlayerProfile }>(`/players/${id}`),
  scores: (id: number, mode: number, type: 'best' | 'recent', limit = 10) =>
    request<{ scores: PlayerScore[] }>(
      `/players/${id}/scores?mode=${mode}&type=${type}&limit=${limit}`,
    ),
  mostPlayed: (id: number, mode: number, limit = 10) =>
    request<{ maps: MostPlayed[] }>(`/players/${id}/most-played?mode=${mode}&limit=${limit}`),
};
