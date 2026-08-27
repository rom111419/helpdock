'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/config/strings';
import { createClient } from '@/lib/supabase/browser';

type Mode = 'signin' | 'signup';

export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    const supabase = createClient();
    const result =
      mode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      setNotice(auth.checkEmail);
      setBusy(false);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mt-8 w-full max-w-sm p-7">
      <h1 className="display text-2xl">{mode === 'signup' ? auth.signUpTitle : auth.signInTitle}</h1>

      <label className="mt-6 block text-sm font-medium" htmlFor="email">{auth.email}</label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="field mt-1.5"
      />

      <label className="mt-4 block text-sm font-medium" htmlFor="password">{auth.password}</label>
      <input
        id="password"
        type="password"
        required
        minLength={8}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="field mt-1.5"
      />
      {mode === 'signup' ? <p className="mt-1.5 text-xs text-muted">{auth.passwordHint}</p> : null}

      {error ? <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-4 rounded-lg bg-positive-soft px-3 py-2 text-sm text-positive">{notice}</p> : null}

      <button type="submit" disabled={busy} className="btn btn-primary mt-6 w-full py-2.5">
        {mode === 'signup' ? auth.signUp : auth.signIn}
      </button>

      <p className="mt-5 text-center text-sm text-muted">
        <Link href={mode === 'signup' ? '/login' : '/login?mode=signup'} className="hover:text-ink">
          {mode === 'signup' ? auth.toSignIn : auth.toSignUp}
        </Link>
      </p>
    </form>
  );
}
