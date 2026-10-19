import { Link } from 'react-router-dom';
import { Bookmark, Star, Clapperboard } from 'lucide-react';
import { img } from '../api';
import { useApp } from '../App';

export const Skeletons = ({ n = 6 }) =>
  Array.from({ length: n }, (_, i) => (
    <div
      key={i}
      className="skeleton aspect-[2/3] rounded-2xl border border-white/5"
    />
  ));

export default function MovieCard({ m, note }) {
  const { wl, toggle } = useApp();
  const saved = wl.some(x => x.id === m.id);

  return (
    <article className="group min-w-0">
      <div className="relative isolate aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-lg shadow-black/20 transition duration-300 group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-2xl">
        <Link
          to={`/movie/${m.id}`}
          aria-label={`View details for ${m.title}`}
          className="absolute inset-0"
        >
          {m.poster ? (
            <img
              src={img(m.poster)}
              alt={`${m.title} poster`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-white/60">
              <Clapperboard size={28} className="text-white/35" />
              <span className="font-semibold">{m.title}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/20 opacity-80 transition group-hover:opacity-100" />

          <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="text-xs font-medium text-white/75">
              View movie details
            </span>
          </div>
        </Link>

        {m.rating != null && (
          <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/65 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
            <Star size={12} fill="currentColor" className="text-amber-300" />
            {Number(m.rating).toFixed(1)}
          </div>
        )}

        <button
          type="button"
          onClick={() => toggle(m)}
          aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
          aria-pressed={saved}
          className={`absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition ${
            saved
              ? 'border-reel/50 bg-reel text-white'
              : 'border-white/15 bg-black/60 text-white hover:bg-black/85'
          }`}
        >
          <Bookmark size={16} className={saved ? 'fill-current' : ''} />
        </button>
      </div>

      <div className="px-0.5 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate text-sm font-bold text-white transition group-hover:text-white">
            {m.title}
          </h3>
          {m.year && (
            <span className="shrink-0 text-xs text-white/40">{m.year}</span>
          )}
        </div>

        {note && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/55">
            {note}
          </p>
        )}
      </div>
    </article>
  );
}