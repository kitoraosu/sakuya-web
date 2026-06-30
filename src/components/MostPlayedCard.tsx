import { FaPlay } from 'react-icons/fa6';
import type { MostPlayed } from '../api/client';
import { beatmapUrl, cover, listThumb } from '../lib/osu';
import { fmtNum, fmtStars } from '../lib/modes';

// Карточка часто игранной карты: фон-обложка, превью слева (с отступом и скруглением), плейкаунт справа.
export default function MostPlayedCard({ item }: { item: MostPlayed }) {
  const { map } = item;
  return (
    <a
      href={beatmapUrl(map.id)}
      target="_blank"
      rel="noreferrer"
      className="group relative block w-full overflow-hidden rounded-xl border border-zinc-800 transition hover:border-pink-500/60"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${cover(map.set_id)})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/45" />

      <div className="relative flex w-full items-center gap-4 p-4">
        <img
          src={listThumb(map.set_id)}
          alt=""
          loading="lazy"
          className="h-14 w-24 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-zinc-100">
            {map.title} <span className="text-pink-300/80">[{map.version}]</span>
          </div>
          <div className="mt-1 truncate text-xs text-zinc-400">
            mapped by {map.creator} · {fmtStars(map.stars)}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pl-2 text-pink-300">
          <FaPlay className="text-xs opacity-70" />
          <span className="text-lg font-bold">{fmtNum(item.playcount)}</span>
        </div>
      </div>
    </a>
  );
}
