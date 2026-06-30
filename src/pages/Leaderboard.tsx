import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError, type LeaderboardEntry } from '../api/client';
import { countryFlag, fmtAcc, fmtNum, fmtPp } from '../lib/modes';
import ModeTabs from '../components/ModeTabs';
import Avatar from '../components/Avatar';

export default function Leaderboard() {
  const [mode, setMode] = useState(0);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.leaderboard(mode);
        if (active) setEntries(res.entries);
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
  }, [mode]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-pink-300">Leaderboard</h1>
      <p className="mt-1 text-zinc-500">Players ranked by performance (pp)</p>

      <div className="mt-6">
        <ModeTabs value={mode} onChange={setMode} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-right">PP</th>
              <th className="hidden px-4 py-3 text-right sm:table-cell">Accuracy</th>
              <th className="hidden px-4 py-3 text-right md:table-cell">Score</th>
              <th className="hidden px-4 py-3 text-right md:table-cell">Plays</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-rose-400">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No players in this mode yet
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              entries.map((e) => (
                <tr key={e.id} className="transition hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-mono text-zinc-500">{e.rank}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/u/${e.id}`}
                      className="flex items-center gap-3 font-medium text-zinc-200 transition hover:text-pink-300"
                    >
                      <Avatar id={e.id} name={e.name} size={32} />
                      <span>
                        {countryFlag(e.country)} {e.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-pink-300">{fmtPp(e.pp)}</td>
                  <td className="hidden px-4 py-3 text-right text-zinc-400 sm:table-cell">
                    {fmtAcc(e.acc)}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-zinc-400 md:table-cell">
                    {fmtNum(e.rscore)}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-zinc-400 md:table-cell">
                    {fmtNum(e.plays)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
