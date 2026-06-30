import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FaCheck } from 'react-icons/fa6';
import { api, ApiError, type MyAccount } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { avatarUrl, bannerUrl } from '../lib/osu';

export default function Settings() {
  const { user } = useAuth();
  const [account, setAccount] = useState<MyAccount | null>(null);

  useEffect(() => {
    let active = true;
    api
      .account()
      .then((res) => {
        if (active) setAccount(res.account);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold text-pink-300">Settings</h1>
      <p className="mt-1 text-zinc-500">Manage your account</p>

      <div className="mt-8 space-y-6">
        <Card title="Email">
          <input
            type="email"
            value={account?.email ?? ''}
            disabled
            readOnly
            className="w-full cursor-not-allowed rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-zinc-400"
          />
          <p className="mt-2 text-xs text-zinc-600">Email cannot be changed.</p>
        </Card>

        <Card title="Avatar">
          <ImageUpload
            initial={avatarUrl(user.id)}
            shape="avatar"
            onUpload={(f) => api.uploadAvatar(f)}
          />
        </Card>

        <Card title="Profile background">
          <ImageUpload
            initial={account?.has_banner ? bannerUrl(user.id) : null}
            shape="banner"
            onUpload={(f) => api.uploadBanner(f)}
            onDone={() => setAccount((a) => (a ? { ...a, has_banner: true } : a))}
          />
        </Card>

        <Card title="Change password">
          <PasswordForm />
        </Card>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">{title}</h2>
      {children}
    </section>
  );
}

function ImageUpload({
  initial,
  shape,
  onUpload,
  onDone,
}: {
  initial: string | null;
  shape: 'avatar' | 'banner';
  onUpload: (file: File) => Promise<unknown>;
  onDone?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  // локальный предпросмотр выбранного файла (без обращения к серверу и без ?t=)
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const objUrl = URL.createObjectURL(file);
    setLocalPreview(objUrl);
    setBusy(true);
    try {
      await onUpload(file);
      onDone?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
      setLocalPreview(null);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const preview = localPreview ?? initial;

  return (
    <div className="flex items-center gap-5">
      {shape === 'avatar' ? (
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-zinc-950 ring-1 ring-zinc-800">
          {preview && <img src={preview} alt="" className="h-full w-full object-cover" />}
        </div>
      ) : (
        <div className="h-20 w-40 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-pink-500/25 to-zinc-900 ring-1 ring-zinc-800">
          {preview && <img src={preview} alt="" className="h-full w-full object-cover" />}
        </div>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-400 disabled:opacity-50"
        >
          {busy ? 'Uploading…' : 'Choose image'}
        </button>
        {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        <p className="mt-2 text-xs text-zinc-600">PNG or JPG, up to 5 MB.</p>
      </div>
    </div>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      await api.changePassword(current, next);
      setDone(true);
      setCurrent('');
      setNext('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to change password');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Current password</label>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none transition focus:border-pink-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">New password</label>
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none transition focus:border-pink-500"
        />
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      {done && (
        <p className="flex items-center gap-2 text-sm text-green-400">
          <FaCheck /> Password updated
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-400 disabled:opacity-50"
      >
        {busy ? 'Saving…' : 'Update password'}
      </button>
    </form>
  );
}
