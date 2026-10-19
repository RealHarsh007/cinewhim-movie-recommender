import {
  createContext,
  useContext,
  useEffect,
  useState,
  lazy,
  Suspense,
} from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  Link,
} from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import {
  Clapperboard,
  Sparkles,
  Menu,
  X,
  LogIn,
  LogOut,
} from 'lucide-react';
import { api, errMsg } from './api';

const Ctx = createContext();
export const useApp = () => useContext(Ctx);

const P = name => lazy(() => import(`./pages/${name}.jsx`));
const Home = P('Home');
const Discover = P('Discover');
const AI = P('AI');
const Movie = P('Movie');
const Watchlist = P('Watchlist');
const Auth = P('Auth');

const links = [
  ['/', 'Home'],
  ['/discover', 'Discover'],
  ['/ai', 'AI Recommendations'],
  ['/watchlist', 'Watchlist'],
];

function Nav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useApp();

  const linkClass = ({ isActive }) =>
    `rounded-xl px-4 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-white/10 text-white shadow-inner shadow-white/5'
        : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0b0c12]/85 backdrop-blur-xl">
      <nav
        className="relative mx-auto flex h-[72px] max-w-7xl items-center px-4 sm:px-6"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center gap-3"
        >
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-reel to-violet shadow-lg shadow-reel/20">
            <Clapperboard size={21} className="text-white" />
            <Sparkles
              size={12}
              className="absolute -right-1 -top-1 rounded-full bg-ink p-0.5 text-amber-300"
            />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-white">
            CineWhim
          </span>
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={linkClass}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden max-w-32 truncate text-sm text-white/55 sm:inline">
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                <LogOut size={15} />
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="hidden items-center gap-2 rounded-xl bg-reel px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-reel/20 transition hover:brightness-110 sm:inline-flex"
            >
              <LogIn size={16} />
              Log in
            </Link>
          )}

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/10 md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(value => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="absolute left-0 right-0 top-full border-b border-white/10 bg-[#101119] p-4 shadow-2xl md:hidden">
            <div className="flex flex-col gap-1">
              {links.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setOpen(false)}
                  className={linkClass}
                >
                  {label}
                </NavLink>
              ))}

              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="mt-2 flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-white/75 hover:bg-white/[0.06]"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center gap-2 rounded-xl bg-reel px-4 py-3 text-sm font-semibold text-white"
                >
                  <LogIn size={16} />
                  Log in
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display font-bold">
          <Clapperboard size={20} className="text-reel" />
          <span>CineWhim</span>
        </Link>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55">
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/discover" className="hover:text-white">Discover</Link>
          <Link to="/ai" className="hover:text-white">AI Picks</Link>
          <Link to="/watchlist" className="hover:text-white">Watchlist</Link>
        </nav>

        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} CineWhim
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [wl, setWl] = useState(() =>
    JSON.parse(localStorage.getItem('wl') || '[]')
  );

  useEffect(() => {
    api.get('/auth/me')
      .then(async response => {
        setUser(response.data.user);
        setWl((await api.get('/watchlist')).data.items);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const toggle = async movie => {
    const has = wl.some(item => item.id === movie.id);
    const item = {
      id: movie.id,
      title: movie.title,
      poster: movie.poster,
      rating: movie.rating,
      year: movie.year,
    };
    const next = has
      ? wl.filter(existing => existing.id !== movie.id)
      : [...wl, item];

    setWl(next);

    try {
      if (user) {
        if (has) await api.delete(`/watchlist/${movie.id}`);
        else await api.post('/watchlist', item);
      } else {
        localStorage.setItem('wl', JSON.stringify(next));
      }

      toast.success(has ? 'Removed from watchlist' : 'Added to watchlist');
    } catch (error) {
      setWl(wl);
      toast.error(errMsg(error));
    }
  };

  const login = async (path, body) => {
    const response = await api.post(`/auth/${path}`, body);
    setUser(response.data.user);

    const merged = await api.post('/watchlist/merge', {
      items: JSON.parse(localStorage.getItem('wl') || '[]'),
    });

    localStorage.removeItem('wl');
    setWl(merged.data.items);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setWl([]);
    toast('Logged out');
  };

  return (
    <Ctx.Provider value={{ user, wl, toggle, login, logout, ready }}>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#151826', color: '#fff' },
          }}
        />

        <Nav />

        <main className="mx-auto max-w-7xl px-4 py-6">
          <Suspense fallback={<div className="skeleton h-64 rounded-xl" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/ai" element={<AI />} />
              <Route path="/movie/:id" element={<Movie />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth signup />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </BrowserRouter>
    </Ctx.Provider>
  );
}