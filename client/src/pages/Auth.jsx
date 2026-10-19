import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Film, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../App';
import { errMsg } from '../api';

export default function Auth({ signup = false }) {
  const { login } = useApp();
  const nav = useNavigate();

  const [mode, setMode] = useState(signup ? 'register' : 'login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMode(signup ? 'register' : 'login');
  }, [signup]);

  const isRegister = mode === 'register';
  const box =
    'mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-violet/60 focus:ring-4 focus:ring-violet/10';

  const on = key => event => {
    setF(current => ({ ...current, [key]: event.target.value }));
  };

  const switchMode = () => {
    const next = isRegister ? 'login' : 'register';
    setMode(next);
    nav(next === 'register' ? '/signup' : '/login');
  };

  const submit = async event => {
    event.preventDefault();
    setBusy(true);

    try {
      const body = isRegister
        ? f
        : { email: f.email, password: f.password };

      await login(isRegister ? 'register' : 'login', body);
      toast.success(isRegister ? 'Account created!' : 'Welcome back!');
      nav('/');
    } catch (error) {
      toast.error(errMsg(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto mt-6 max-w-5xl">
      <section className="grid overflow-hidden rounded-3xl border border-white/10 bg-panel shadow-2xl shadow-black/30 lg:min-h-[590px] lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#21152b] via-[#171523] to-[#11131b] p-10 lg:flex">
          <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-violet/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-reel/20 blur-3xl" />

          <div className="relative flex items-center gap-3 font-display text-xl font-extrabold">
            <Film className="text-reel" size={25} />
            CineMind AI
          </div>

          <div className="relative">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-violet/30 bg-violet/15 text-violet-200">
              <Sparkles size={22} />
            </div>
            <h2 className="font-display text-4xl font-extrabold leading-tight">
              Your next favorite movie is waiting.
            </h2>
            <p className="mt-4 max-w-sm leading-7 text-white/55">
              Discover films picked for your mood, explore what’s trending, and
              keep your watchlist in one place.
            </p>
          </div>

          <p className="relative text-xs text-white/35">
            Find your next story with CineMind.
          </p>
        </div>

        <div className="flex items-center p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
                {isRegister ? 'Join CineMind' : 'Welcome back'}
              </p>
              <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
                {isRegister ? 'Create your account' : 'Sign in to continue'}
              </h1>
              <p className="mt-2 text-sm text-white/50">
                {isRegister
                  ? 'Save movies and get picks made for you.'
                  : 'Your watchlist and movie picks are ready.'}
              </p>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.form
                key={mode}
                onSubmit={submit}
                initial={{ opacity: 0, x: isRegister ? 36 : -36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRegister ? -36 : 36 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-5"
              >
                {isRegister && (
                  <label className="block text-sm font-medium text-white/75">
                    Name
                    <input
                      required
                      maxLength={60}
                      autoComplete="name"
                      value={f.name}
                      onChange={on('name')}
                      placeholder="Your name"
                      className={box}
                    />
                  </label>
                )}

                <label className="block text-sm font-medium text-white/75">
                  Email
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={f.email}
                    onChange={on('email')}
                    placeholder="you@example.com"
                    className={box}
                  />
                </label>

                <label className="block text-sm font-medium text-white/75">
                  Password
                  <input
                    required
                    minLength={8}
                    type="password"
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    value={f.password}
                    onChange={on('password')}
                    placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
                    className={box}
                  />
                </label>

                <button
                  type="submit"
                  disabled={busy}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-reel px-5 py-3.5 font-semibold text-white shadow-lg shadow-reel/20 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
                >
                  {busy
                    ? 'Please wait…'
                    : isRegister
                      ? 'Create account'
                      : 'Log in'}
                  {!busy && (
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </button>
              </motion.form>
            </AnimatePresence>

            <p className="mt-7 text-center text-sm text-white/50">
              {isRegister ? 'Already have an account?' : 'New to CineMind?'}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="font-semibold text-white underline decoration-violet/60 underline-offset-4 transition hover:text-violet-200"
              >
                {isRegister ? 'Log in' : 'Create an account'}
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}