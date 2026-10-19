import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Search, Sparkles, Star } from 'lucide-react';
import { api, img, errMsg } from '../api';
import Row from '../components/Row';
import { useApp } from '../App';

export default function Home() {
  const [hero, setHero] = useState(null);
  const [q, setQ] = useState('');
  const [sug, setSug] = useState([]);
  const [searchErr, setSearchErr] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const nav = useNavigate();
  const { user, toggle } = useApp();

  useEffect(() => {
    api.get('/movies/trending')
      .then(r => setHero(r.data.results.find(m => m.backdrop) || r.data.results[0]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const query = q.trim();

    if (query.length < 2) {
      setSug([]);
      setSearchErr('');
      setSearching(false);
      setSearchDone(false);
      return;
    }

    const controller = new AbortController();
    setSug([]);
    setSearchErr('');
    setSearching(true);
    setSearchDone(false);

    const timer = setTimeout(() => {
      api.get('/movies/search', {
        params: { q: query },
        signal: controller.signal,
      })
        .then(r => {
          if (controller.signal.aborted) return;
          setSug(r.data.results.slice(0, 5));
          setSearchDone(true);
        })
        .catch(e => {
          if (controller.signal.aborted) return;
          setSearchErr(errMsg(e));
          setSearchDone(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  const showSearchPanel =
    q.trim().length >= 2 &&
    (searching || searchErr || sug.length > 0 || searchDone);

  return (
    <main className="relative">
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[min(900px,90vw)] -translate-x-1/2 rounded-full bg-reel/10 blur-3xl" />

      <div className="relative z-20 mb-7 max-w-xl">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
          size={19}
        />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search movies, shows..."
          aria-label="Search movies"
          aria-autocomplete="list"
          className="w-full rounded-2xl border border-white/10 bg-panel/90 py-3.5 pl-12 pr-4 text-sm text-white shadow-xl shadow-black/20 outline-none transition placeholder:text-white/40 focus:border-reel/60 focus:ring-4 focus:ring-reel/10"
        />

        {showSearchPanel && (
          <div
            className="absolute mt-2 max-h-96 w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#11131b]/95 p-2 shadow-2xl backdrop-blur-xl"
            role="status"
            aria-live="polite"
          >
            {searching && (
              <p className="px-3 py-3 text-sm text-white/55">Searching movies…</p>
            )}

            {!searching && searchErr && (
              <p className="px-3 py-3 text-sm text-reel">{searchErr}</p>
            )}

            {!searching && !searchErr && searchDone && sug.length === 0 && (
              <p className="px-3 py-3 text-sm text-white/55">
                No movies found for “{q.trim()}”.
              </p>
            )}

            {!searching && !searchErr && sug.length > 0 && (
              <ul>
                {sug.map(m => (
                  <li key={m.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/[0.07]"
                      onClick={() => nav(`/movie/${m.id}`)}
                    >
                      <img
                        src={img(m.poster, 'w185')}
                        alt=""
                        className="h-14 w-10 rounded-md bg-white/10 object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{m.title}</span>
                        <span className="mt-1 block text-xs text-white/45">
                          {m.year || m.release_date || 'Movie'}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {hero && (
        <section className="group relative mb-14 min-h-[440px] overflow-hidden rounded-[28px] border border-white/10 bg-[#151722] shadow-2xl shadow-black/30 md:min-h-[540px]">
          <img
            src={img(hero.backdrop, 'w1280')}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-black/10" />

          <div className="relative flex min-h-[440px] max-w-3xl flex-col justify-end p-6 sm:p-9 md:min-h-[540px] md:justify-center md:p-14">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/75 backdrop-blur">
              <Sparkles size={14} className="text-reel" />
              Featured tonight
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">
              {hero.title}
            </h1>

            <div className="mt-4 flex items-center gap-3 text-sm text-white/65">
              {hero.year && <span>{hero.year}</span>}
              {hero.rating > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <Star size={14} fill="currentColor" />
                  {Number(hero.rating).toFixed(1)}
                </span>
              )}
            </div>

            <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
              {hero.overview || 'Discover your next favorite movie with CineMind AI.'}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to={`/movie/${hero.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-reel px-5 py-3 font-semibold text-white shadow-lg shadow-reel/20 transition hover:brightness-110 active:scale-[0.98]"
              >
                <Play size={17} fill="currentColor" />
                Watch trailer
              </Link>

              <Link
                to={`/movie/${hero.id}`}
                className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                View details
              </Link>

              <button
                type="button"
                onClick={() => toggle(hero)}
                className="rounded-xl border border-white/15 bg-black/20 px-5 py-3 font-semibold text-white/85 backdrop-blur transition hover:bg-white/10"
              >
                + Watchlist
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="space-y-12 md:space-y-14">
        {user && <Row title="Picked for you" path="/users/recommendations" />}
        <Row title="Trending now" path="/movies/trending" />
        <Row title="Popular picks" path="/movies/popular" />
        <Row title="Top rated" path="/movies/top-rated" />
        <Row title="Coming soon" path="/movies/upcoming" />
      </div>
    </main>
  );
}