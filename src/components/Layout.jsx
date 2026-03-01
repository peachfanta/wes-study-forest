import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import SpotifyPlayer from './SpotifyPlayer';
import { NAV_ITEMS } from '../utils/constants';

function Layout({ children }) {
  const location = useLocation();
  const { state } = useAppContext();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-6 md:px-6">
      <header className="glass-panel mb-6 flex flex-wrap items-center justify-between gap-4 p-4 md:p-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-cyan-100">Study Forest</h1>
          <p className="text-sm text-slate-400">Grow your focus, one session at a time.</p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-xl px-4 py-2 text-sm transition ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-200 shadow-glow'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <section className="mt-6">
        <SpotifyPlayer token={state.spotifyToken} playlist={state.spotifyPlaylist} />
      </section>
    </div>
  );
}

export default Layout;
