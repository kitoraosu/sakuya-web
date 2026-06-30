// Утилиты для отображения osu!-данных

export const cover = (setId: number): string =>
  `https://assets.ppy.sh/beatmaps/${setId}/covers/cover.jpg`;
export const listThumb = (setId: number): string =>
  `https://assets.ppy.sh/beatmaps/${setId}/covers/list@2x.jpg`;
export const beatmapUrl = (mapId: number): string => `https://osu.ppy.sh/b/${mapId}`;

// Аватар bancho (a.<domain>/<id>) и баннер профиля — без query (свежесть через no-cache на nginx)
export const avatarUrl = (id: number): string => `https://a.sakuya.qzz.io/${id}`;
export const bannerUrl = (id: number): string => `/uploads/banners/${id}.jpg`;

const MOD_FLAGS: [number, string][] = [
  [1, 'NF'], [2, 'EZ'], [4, 'TD'], [8, 'HD'], [16, 'HR'], [32, 'SD'],
  [64, 'DT'], [128, 'RX'], [256, 'HT'], [512, 'NC'], [1024, 'FL'],
  [2048, 'AU'], [4096, 'SO'], [8192, 'AP'], [16384, 'PF'],
];

export function decodeMods(mods: number): string[] {
  if (!mods) return [];
  const out: string[] = [];
  for (const [flag, name] of MOD_FLAGS) {
    if (mods & flag) out.push(name);
  }
  if (out.includes('NC')) {
    const i = out.indexOf('DT');
    if (i !== -1) out.splice(i, 1);
  }
  return out;
}

export function gradeColor(grade: string): string {
  switch (grade.toUpperCase()) {
    case 'XH':
    case 'SSH':
      return 'text-zinc-200';
    case 'X':
    case 'SS':
      return 'text-yellow-300';
    case 'SH':
    case 'S':
      return 'text-sky-300';
    case 'A':
      return 'text-green-400';
    case 'B':
      return 'text-blue-400';
    case 'C':
      return 'text-purple-400';
    default:
      return 'text-rose-400';
  }
}

export function gradeLabel(grade: string): string {
  const g = grade.toUpperCase();
  if (g === 'XH' || g === 'X') return 'SS';
  if (g === 'SH') return 'S';
  return g;
}

export const hitColors = {
  n300: 'text-sky-300',
  n100: 'text-green-400',
  n50: 'text-yellow-400',
  nmiss: 'text-rose-400',
};
