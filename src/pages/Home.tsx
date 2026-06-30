import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="text-center md:text-left">
          <span className="mb-4 inline-block rounded-full border border-pink-500/30 px-4 py-1 text-xs uppercase tracking-widest text-pink-300">
            private osu! server
          </span>
          <h1 className="bg-gradient-to-r from-pink-300 to-rose-500 bg-clip-text text-6xl font-extrabold text-transparent" style={{ height: '70px' }}>
            Sakuya
          </h1>
          <p className="mt-6 text-lg text-zinc-400">
            Your own osu! server: player rankings, profiles and stats across all modes.
            Connect and climb the leaderboard.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
            <Link
              to="/leaderboard"
              className="rounded-lg bg-pink-500 px-6 py-3 font-medium text-white transition hover:bg-pink-400"
            >
              Leaderboard
            </Link>
            {user ? (
              <Link
                to={`/u/${user.id}`}
                className="rounded-lg border border-zinc-700 px-6 py-3 font-medium text-zinc-300 transition hover:border-pink-500/50 hover:text-pink-300"
              >
                My profile
              </Link>
            ) : (
              <Link
                to="/register"
                className="rounded-lg border border-zinc-700 px-6 py-3 font-medium text-zinc-300 transition hover:border-pink-500/50 hover:text-pink-300"
              >
                Create account
              </Link>
            )}
          </div>

          <p className="mt-6 text-sm text-zinc-600">
            Connect to server: <code className="text-pink-300/80">--devserver sakuya.qzz.io</code>
          </p>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
          <img
            src="/sakuya.png"
            alt="Sakuya Izayoi — server mascot"
            className="relative max-h-[420px] w-auto drop-shadow-[0_0_25px_rgba(236,72,153,0.25)]"
          />
        </div>
      </div>
    </main>
  );
}
