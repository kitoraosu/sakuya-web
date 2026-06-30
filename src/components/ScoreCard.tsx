import { FaArrowUpRightFromSquare } from 'react-icons/fa6';
import type { PlayerScore } from '../api/client';
import { beatmapUrl, cover, decodeMods, gradeColor, gradeLabel, hitColors, listThumb } from '../lib/osu';
import { fmtAcc, fmtNum, fmtStars, timeAgo } from '../lib/modes';

// Карточка скора: фон — обложка карты, слева грейд+превью+инфо, справа pp.
export default function ScoreCard({ score }: { score: PlayerScore }) {
  const { map } = score;
  const mods = decodeMods(score.mods);

  return (
    <a
      href={beatmapUrl(map.id)}
      target="_blank"
      rel="noreferrer"
      className="group relative block w-full overflow-hidden rounded-xl border border-zinc-800 transition hover:border-pink-500/60"
    >
      {/* фон обложки карты */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${cover(map.set_id)})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/40" />

      <div className="relative flex w-full items-center gap-4 p-4">
        {/* грейд */}
        <div className={`w-10 shrink-0 text-center text-3xl font-black ${gradeColor(score.grade)}`}>
          {gradeLabel(score.grade)}
        </div>

        {/* превью карты */}
        <img
          src={listThumb(map.set_id)}
          alt=""
          loading="lazy"
          className="hidden h-12 w-20 shrink-0 rounded-md object-cover ring-1 ring-white/10 sm:block"
        />

        {/* инфо — растягивается, толкая pp вправо */}
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-zinc-100">
            {map.title} <span className="text-pink-300/80">[{map.version}]</span>
          </div>
          <div className="mt-1 truncate text-xs text-zinc-400">
            {map.artist} · {fmtStars(map.stars)}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium">
            <span className={hitColors.n300}>{fmtNum(score.n300)}</span>
            <span className={hitColors.n100}>{fmtNum(score.n100)}</span>
            <span className={hitColors.n50}>{fmtNum(score.n50)}</span>
            <span className={hitColors.nmiss}>{fmtNum(score.nmiss)}miss</span>
            <span className="text-zinc-200">{fmtAcc(score.acc)}</span>
            {mods.length > 0 && (
              <span className="font-mono font-semibold text-amber-300">+{mods.join('')}</span>
            )}
          </div>
        </div>

        {/* pp — прижат к правому краю */}
        <div className="shrink-0 pl-2 text-right">
          <div className="text-xl font-bold text-pink-300">{Math.round(score.pp)}pp</div>
          <div className="mt-1 flex items-center justify-end gap-1.5 text-[11px] text-zinc-400">
            {timeAgo(score.play_time)}
            <FaArrowUpRightFromSquare className="opacity-0 transition group-hover:opacity-70" />
          </div>
        </div>
      </div>
    </a>
  );
}
