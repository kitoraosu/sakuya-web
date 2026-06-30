import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

const SITEKEY = import.meta.env.VITE_HCAPTCHA_SITEKEY as string;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const captchaRef = useRef<HCaptcha>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});

    if (!captcha) {
      setError('Please complete the captcha');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register(username, email, password, captcha);
      navigate(`/u/${user.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fields) setFields(err.fields);
      } else {
        setError('Failed to register');
      }
      // токен hCaptcha одноразовый — сбрасываем
      captchaRef.current?.resetCaptcha();
      setCaptcha('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
        <h1 className="text-2xl font-bold text-pink-300">Create account</h1>
        <p className="mt-1 text-sm text-zinc-500">Join the server</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field
            label="Username"
            hint="2-15 characters"
            error={fields.username}
            value={username}
            onChange={setUsername}
            autoComplete="username"
          />
          <Field
            label="Email"
            type="email"
            error={fields.email}
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <Field
            label="Password"
            type="password"
            hint="8-32 characters"
            error={fields.password}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />

          {SITEKEY && (
            <div className="flex justify-center">
              <HCaptcha
                ref={captchaRef}
                sitekey={SITEKEY}
                theme="dark"
                onVerify={(token) => setCaptcha(token)}
                onExpire={() => setCaptcha('')}
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-pink-500 py-2.5 font-medium text-white transition hover:bg-pink-400 disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-300 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  error,
  value,
  onChange,
  type = 'text',
  autoComplete,
}: {
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-sm text-zinc-400">{label}</label>
        {hint && <span className="text-xs text-zinc-600">{hint}</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className={`w-full rounded-lg border bg-zinc-950 px-3 py-2 text-white outline-none transition focus:border-pink-500 ${
          error ? 'border-rose-500/60' : 'border-zinc-700'
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
