import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaClock, FaFire, FaTrophy } from 'react-icons/fa6';
import {
  api,
  ApiError,
  type MostPlayed,
  type PlayerProfile,
  type PlayerScore,
} from '../api/client';
import { countryFlag, fmtAcc, fmtDate, fmtNum, fmtPlaytime, fmtPp, modeLabel } from '../lib/modes';
import { bannerUrl } from '../lib/osu';
import ModeTabs from '../components/ModeTabs';
import Avatar from '../components/Avatar';
import ScoreCard from '../components/ScoreCard';
import MostPlayedCard from '../components/MostPlayedCard';

export default function Profile() {
  const { id } = useParams();
  const pid = Number(id);
  const validId = Number.isInteger(pid) && pid >= 1;

  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [mode, setMode] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [best, setBest] = useState<PlayerScore[]>([]);
  const [recent, setRecent] = useState<PlayerScore[]>([]);
  const [mostPlayed, setMostPlayed] = useState<MostPlayed[]>([]);

  useEffect(() => {
    if (!validId) return;
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.player(pid);
        if (!active) return;
        setProfile(res.profile);
        const top = [...res.profile.stats].sort((a, b) => b.plays - a.plays)[0];
        if (top && top.plays > 0) setMode(top.mode);
      } catch (err) {
        if (active) setError(err instanceof ApiError ? err.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [pid, validId]);

  useEffect(() => {
    if (!validId) return;
    let active = true;
    async function loadScores() {
      try {
        const [b, r, mp] = await Promise.all([
          api.scores(pid, mode, 'best', 8),
          api.scores(pid, mode, 'recent', 8),
          api.mostPlayed(pid, mode, 8),
        ]);
        if (!active) return;
        setBest(b.scores);
        setRecent(r.scores);
        setMostPlayed(mp.maps);
      } catch {
        if (active) {
          setBest([]);
          setRecent([]);
          setMostPlayed([]);
        }
      }
    }
    loadScores();
    return () => {
      active = false;
    };
  }, [pid, mode, validId]);

  if (!validId) {
    return <main className="px-6 py-16 text-center text-rose-400">Invalid id</main>;
  }
  if (loading) {
    return <main className="px-6 py-16 text-center text-pink-300">Loading…</main>;
  }
  if (error || !profile) {
    return <main className="px-6 py-16 text-center text-rose-400">{error ?? 'Not found'}</main>;
  }

  const stat = profile.stats.find((s) => s.mode === mode) ?? profile.stats[0];
  const banner = profile.has_banner ? bannerUrl(profile.id) : null;

  return (
    <div className="relative">
      {/* Фон всей страницы: баннер сверху, растворяется в фон страницы */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[460px] overflow-hidden">
        {banner ? (
          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${banner})` }} />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-pink-600/25 via-zinc-900 to-zinc-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-zinc-950/75 to-zinc-950" />
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-10">
        {/* Шапка с баннером внутри блока */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800">
          {banner ? (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${banner})` }} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/30 via-zinc-900 to-zinc-950" />
          )}
          <div className="absolute inset-0 bg-zinc-950/55 backdrop-blur-[1px]" />

          <div className="relative flex flex-col items-center gap-5 p-8 sm:flex-row sm:items-center">
            <Avatar id={profile.id} name={profile.name} size={112} />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white drop-shadow">
                {countryFlag(profile.country)} {profile.name}
              </h1>
              <p className="mt-1 text-sm text-zinc-300/90">Joined {fmtDate(profile.creation_time)}</p>
            </div>
          </div>
        </div>

        {/* Режимы */}
        <div className="mt-6">
          <ModeTabs value={mode} onChange={setMode} />
        </div>

        {/* Статистика */}
        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm uppercase tracking-wide text-zinc-500">Statistics</h2>
            <span className="text-xs text-zinc-600">{modeLabel(mode)}</span>
          </div>
          {stat ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
              <StatItem label="Performance" value={fmtPp(stat.pp)} accent />
              <StatItem label="Accuracy" value={fmtAcc(stat.acc)} />
              <StatItem label="Play Count" value={fmtNum(stat.plays)} />
              <StatItem label="Play Time" value={fmtPlaytime(stat.playtime)} />
              <StatItem label="Ranked Score" value={fmtNum(stat.rscore)} />
              <StatItem label="Total Score" value={fmtNum(stat.tscore)} />
              <StatItem label="Max Combo" value={`${fmtNum(stat.max_combo)}x`} />
              <StatItem label="Total Hits" value={fmtNum(stat.total_hits)} />
            </div>
          ) : (
            <p className="text-zinc-500">No data for this mode</p>
          )}

          {stat && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-zinc-800 pt-5">
              <GradePill label="SS+" value={stat.xh_count} color="text-zinc-200" />
              <GradePill label="SS" value={stat.x_count} color="text-yellow-300" />
              <GradePill label="S+" value={stat.sh_count} color="text-sky-300" />
              <GradePill label="S" value={stat.s_count} color="text-sky-400" />
              <GradePill label="A" value={stat.a_count} color="text-green-400" />
            </div>
          )}
        </section>

        {/* Скоры и карты */}
        <Section icon={<FaTrophy />} title="Best Scores">
          {best.length ? best.map((s) => <ScoreCard key={s.id} score={s} />) : <Empty>No ranked scores yet</Empty>}
        </Section>
        <Section icon={<FaClock />} title="Recent Scores">
          {recent.length ? recent.map((s) => <ScoreCard key={s.id} score={s} />) : <Empty>No recent plays</Empty>}
        </Section>
        <Section icon={<FaFire />} title="Most Played Beatmaps">
          {mostPlayed.length ? (
            mostPlayed.map((m) => <MostPlayedCard key={m.map.id} item={m} />)
          ) : (
            <Empty>No plays yet</Empty>
          )}
        </Section>
      </main>
    </div>
  );
}

function StatItem({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`mt-1 text-lg font-bold ${accent ? 'text-pink-300' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function GradePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-1.5">
      <span className={`font-bold ${color}`}>{label}</span>
      <span className="text-sm text-zinc-400">{value}</span>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-pink-300">
        <span className="text-pink-400/70">{icon}</span>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 px-4 py-6 text-center text-sm text-zinc-600">
      {children}
    </div>
  );
}
