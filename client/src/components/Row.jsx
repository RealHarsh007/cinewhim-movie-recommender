import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, errMsg } from '../api';
import MovieCard, { Skeletons } from './MovieCard';

export default function Row({ title, path }) {
  const [d, setD] = useState(null);
  const [e, setE] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    api.get(path)
      .then(r => setD(r.data.results))
      .catch(x => setE(errMsg(x)));
  }, [path]);

  function slide(direction) {
  const list = listRef.current;
  if (!list) return;

  const card = list.querySelector(':scope > *');
  const gap = 12; // gap-3
  const distance = card ? card.getBoundingClientRect().width + gap : list.clientWidth * 0.8;

  list.scrollBy({
    left: direction * distance,
    behavior: 'smooth',
  });
}

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => slide(-1)}
            aria-label={`Slide ${title} left`}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-reel/50 hover:bg-reel/15"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => slide(1)}
            aria-label={`Slide ${title} right`}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-reel/50 hover:bg-reel/15"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {e ? (
        <p className="text-reel">{e}</p>
      ) : (
        <div
          ref={listRef}
          className="grid grid-flow-col auto-cols-[40%] gap-3 overflow-x-auto pb-3 sm:auto-cols-[22%] lg:auto-cols-[14%]"
          tabIndex={0}
          aria-label={title}
        >
          {d
            ? d.map(m => <MovieCard key={m.id} m={m} />)
            : <Skeletons />}
        </div>
      )}
    </section>
  );
}