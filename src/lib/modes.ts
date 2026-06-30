export interface GameMode {
  id: number;
  label: string;
}

export const MODES: GameMode[] = [
  { id: 0, label: 'osu!' },
  { id: 1, label: 'taiko' },
  { id: 2, label: 'catch' },
  { id: 3, label: 'mania' },
  { id: 4, label: 'osu! (rx)' },
  { id: 5, label: 'taiko (rx)' },
  { id: 6, label: 'catch (rx)' },
  { id: 8, label: 'osu! (ap)' },
];

export function modeLabel(id: number): string {
  return MODES.find((m) => m.id === id)?.label ?? `mode ${id}`;
}

export function countryFlag(code: string): string {
  if (!code || code.length !== 2 || code === 'xx') return '🏳️';
  const base = 0x1f1e6;
  const cc = code.toUpperCase();
  return String.fromCodePoint(base + cc.charCodeAt(0) - 65, base + cc.charCodeAt(1) - 65);
}

export const fmtNum = (n: number): string => n.toLocaleString('en-US');
export const fmtPp = (n: number): string => `${Math.round(n).toLocaleString('en-US')}pp`;
export const fmtAcc = (n: number): string => `${n.toFixed(2)}%`;
export const fmtStars = (n: number): string => `${n.toFixed(2)}★`;

export function fmtPlaytime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function fmtDate(unix: number): string {
  if (!unix) return '—';
  return new Date(unix * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// "2026-06-19T14:01:32.000Z" -> относительное "3d ago"
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const sec = Math.floor((Date.now() - then) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}
