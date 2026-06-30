// Подмножество таблицы `users` из bancho.py
export interface BanchoUser {
  id: number;
  name: string;
  safe_name: string;
  email: string;
  priv: number;
  pw_bcrypt: string;
  country: string;
}

export interface PublicUser {
  id: number;
  name: string;
  country: string;
  priv: number;
}

export interface JwtPayload {
  id: number;
  name: string;
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
  stats: ModeStats[];
}

// Карта (таблица `maps`) — то, что нужно для отображения скора
export interface ScoreMap {
  id: number;
  set_id: number;
  title: string;
  artist: string;
  version: string;
  creator: string;
  stars: number;
}

// Скор игрока (таблица `scores` + join `maps`)
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

// Часто игранная карта
export interface MostPlayed {
  playcount: number;
  map: ScoreMap;
}
