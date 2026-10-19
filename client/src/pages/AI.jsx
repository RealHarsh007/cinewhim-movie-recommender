import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Star,
  WandSparkles,
} from 'lucide-react';
import { api, errMsg, GENRES } from '../api';
import MovieCard, { Skeletons } from '../components/MovieCard';

const EX = [
  'Recommend a mind-bending thriller with a shocking ending',
  'I want an emotional movie about friendship',
  'Suggest underrated science-fiction movies',
  'Find movies similar to Interstellar',
  'Recommend a light comedy for a family movie night',
  'Suggest a great anime movie',
  'Recommend a Korean movie with a moving drama story',
];

const moods = ['mind-bending', 'emotional', 'light', 'dark', 'inspiring', 'feel-good'];

export default function AI() {
  const [prompt, setP] = useState('');
  const [genres, setG] = useState([]);
  const [mood, setMood] = useState('');
  const [minRating, setR] = useState(0);
  const [underrated, setU] = useState(false);
  const [family, setFam] = useState(false);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!prompt.trim() && !genres.length && !mood) {
      toast.error('Describe what you feel like watching, or pick a genre or mood');
      return;
    }

    setBusy(true);
    try {
      const { data } = await api.post('/ai/recommendations', {
        prompt: prompt.trim() || undefined,
        genres,
        mood: mood || undefined,
        minRating: minRating || undefined,
        underrated,
        family,
      });
      setRes(data);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const clearFilters = () => {
    setP('');
    setG([]);
    setMood('');
    setR(0);
    setU(false);
    setFam(false);
    setRes(null);
  };

  const toggleGenre = id => {
    setG(current =>
      current.includes(id)
        ? current.filter(x => x !== id)
        : current.length < 5
          ? [...current, id]
          : current
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-panel p-6 shadow-2xl shadow-black/20 sm:p-9 lg:p-11">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-violet/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-reel/10 blur-3xl" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-200">
            <Sparkles size={14} />
            Your personal movie finder
          </div>

          <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-6xl">
            Tell CineMind what you feel like watching.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
            Describe the mood, story, or kind of movie you want. We’ll find a
            selection that fits.
          </p>

          <div className="relative mt-7">
            <textarea
              value={prompt}
              maxLength={500}
              onChange={e => setP(e.target.value)}
              aria-label="What do you feel like watching?"
              rows={4}
              placeholder={EX[0]}
              className="w-full resize-y rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-white/35 focus:border-violet/60 focus:ring-4 focus:ring-violet/10 sm:p-5 sm:text-base"
            />
            <span className="absolute bottom-3 right-4 text-xs text-white/35">
              {prompt.length}/500
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {EX.map(example => (
              <button
                key={example}
                type="button"
                onClick={() => setP(example)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-xs text-white/70 transition hover:border-violet/40 hover:bg-violet/10 hover:text-white"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet/15 text-violet-200">
            <SlidersHorizontal size={19} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Tune your picks</h2>
            <p className="mt-0.5 text-sm text-white/45">Choose up to 5 genres</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(GENRES).map(([name, id]) => {
            const selected = genres.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleGenre(id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selected
                    ? 'border-violet bg-violet text-white shadow-lg shadow-violet/20'
                    : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25 hover:bg-white/[0.08]'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>

        <div className="my-6 border-t border-white/10" />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1fr] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/45">
              Mood
            </span>
            <select
              aria-label="Mood"
              value={mood}
              onChange={e => setMood(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-[#11131b] px-4 py-3 text-sm text-white outline-none focus:border-violet/60"
            >
              <option value="">Any mood</option>
              {moods.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/45">
              Minimum rating
              <span className="inline-flex items-center gap-1 text-amber-300">
                <Star size={13} fill="currentColor" />
                {minRating ? `${minRating}+` : 'Any'}
              </span>
            </span>
            <input
              type="range"
              min="0"
              max="9"
              value={minRating}
              onChange={e => setR(Number(e.target.value))}
              aria-label="Minimum rating"
              className="mt-2 w-full accent-violet"
            />
            <span className="mt-1 flex justify-between text-[11px] text-white/35">
              <span>Any</span><span>9+</span>
            </span>
          </label>

          <div className="flex flex-wrap gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white/75 transition hover:bg-white/[0.08]">
              <input
                type="checkbox"
                checked={underrated}
                onChange={e => setU(e.target.checked)}
                className="accent-violet"
              />
              Underrated
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white/75 transition hover:bg-white/[0.08]">
              <input
                type="checkbox"
                checked={family}
                onChange={e => setFam(e.target.checked)}
                className="accent-violet"
              />
              Family-friendly
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-white/55 transition hover:bg-white/[0.06] hover:text-white"
          >
            <RotateCcw size={15} />
            Clear choices
          </button>

          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-reel px-6 py-3 font-semibold text-white shadow-lg shadow-reel/20 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
          >
            <WandSparkles size={18} />
            {busy ? 'Finding movies…' : res ? 'Find another match' : 'Recommend movies'}
          </button>
        </div>
      </section>

      {res?.source === 'fallback' && (
        <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/50">
          CineMind’s built-in recommendation engine is finding these picks.
        </p>
      )}

      {busy && (
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">Finding your next favorite…</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Skeletons n={8} />
          </div>
        </section>
      )}

      {!busy && res && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
                CineMind picks
              </p>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Made for your mood
              </h2>
            </div>
            <span className="text-sm text-white/45">
              {res.results?.length || 0} movies
            </span>
          </div>

          {res.results?.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {res.results.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <MovieCard m={movie} note={movie.reason} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="font-semibold">No matches this time</p>
              <p className="mt-2 text-sm text-white/50">
                Try lowering the rating or removing a genre, then search again.
              </p>
            </div>
          )}
        </section>
      )}

      {!busy && !res && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-white/35">
          <Sparkles size={15} />
          Your recommendations will appear here
        </div>
      )}
    </div>
  );
}