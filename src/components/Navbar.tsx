import { Link, useNavigate } from 'react-router-dom';
import { FaGear, FaRightFromBracket } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-pink-500/20 bg-zinc-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold tracking-wide text-pink-400">
          sakuya<span className="text-zinc-500">.web</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-zinc-300 transition hover:text-pink-300">
            Home
          </Link>
          <Link to="/leaderboard" className="text-zinc-300 transition hover:text-pink-300">
            Leaderboard
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={`/u/${user.id}`}
                className="flex items-center gap-2 text-zinc-200 transition hover:text-pink-300"
              >
                <Avatar id={user.id} name={user.name} size={28} />
                <span className="font-medium">{user.name}</span>
              </Link>
              <Link
                to="/settings"
                title="Settings"
                className="text-zinc-400 transition hover:text-pink-300"
              >
                <FaGear />
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="text-zinc-400 transition hover:text-pink-300"
              >
                <FaRightFromBracket />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-pink-500 px-4 py-1.5 font-medium text-white transition hover:bg-pink-400"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
