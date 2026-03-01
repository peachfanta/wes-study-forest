import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function TimerPage() {
  const { state, actions, constants, timerDurationMinutes, timerElapsedSeconds, activeTimerTask } = useAppContext();

  const [spotifyTokenInput, setSpotifyTokenInput] = useState(state.spotifyToken || '');
  const [spotifyPlaylistInput, setSpotifyPlaylistInput] = useState(state.spotifyPlaylist || '');

  useEffect(() => {
    setSpotifyTokenInput(state.spotifyToken || '');
    setSpotifyPlaylistInput(state.spotifyPlaylist || '');
  }, [state.spotifyToken, state.spotifyPlaylist]);

  const sessionXp = Math.floor(timerElapsedSeconds / 60) * constants.XP_PER_STUDY_MINUTE;

  const sessionProgress = useMemo(() => {
    if (state.timer.durationSeconds === 0) return 0;
    return Math.min(100, Math.round((timerElapsedSeconds / state.timer.durationSeconds) * 100));
  }, [state.timer.durationSeconds, timerElapsedSeconds]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <section className="space-y-4">
        <div className="glass-panel p-5">
          <h2 className="mb-4 text-xl font-semibold text-slate-100">Study Timer</h2>

          <div className="mb-5 flex flex-wrap items-end gap-3">
            <label className="text-sm text-slate-300">
              Duration (minutes)
              <input
                type="number"
                min="1"
                max="240"
                value={timerDurationMinutes}
                onChange={(e) => actions.setTimerDurationMinutes(Number(e.target.value) || 1)}
                disabled={state.timer.mode === 'running'}
                className="mt-1 block w-36 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 disabled:opacity-50"
              />
            </label>

            <label className="text-sm text-slate-300">
              Current Task
              <select
                value={state.timer.selectedTaskId}
                onChange={(e) => actions.setTimerTask(e.target.value)}
                className="mt-1 block w-60 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              >
                <option value="">General Study</option>
                {state.tasks
                  .filter((task) => !task.completed)
                  .map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.name} ({task.subject})
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="mb-5 rounded-2xl bg-slate-900/70 p-6 text-center">
            <p className="text-6xl font-semibold tracking-tight text-cyan-100">{formatTime(state.timer.remainingSeconds)}</p>
            <p className="mt-2 text-sm text-slate-400">XP gained this session: {sessionXp}</p>
            <p className="mt-1 text-xs text-slate-500">Mode: {state.timer.mode}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                style={{ width: `${sessionProgress}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={actions.startTimer}
              disabled={state.timer.mode === 'running'}
              className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm text-emerald-100 disabled:opacity-50"
            >
              Start
            </button>
            <button
              type="button"
              onClick={actions.pauseTimer}
              disabled={state.timer.mode !== 'running'}
              className="rounded-lg bg-amber-500/20 px-4 py-2 text-sm text-amber-100 disabled:opacity-50"
            >
              Pause
            </button>
            <button
              type="button"
              onClick={actions.resetTimer}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-100"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="glass-panel p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Spotify Settings</h3>
          <div className="space-y-3">
            <textarea
              value={spotifyTokenInput}
              onChange={(e) => setSpotifyTokenInput(e.target.value)}
              rows={4}
              placeholder="Paste Spotify OAuth token"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs"
            />
            <input
              value={spotifyPlaylistInput}
              onChange={(e) => setSpotifyPlaylistInput(e.target.value)}
              placeholder="Spotify playlist link"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs"
            />
            <button
              type="button"
              onClick={() =>
                actions.setSpotifyConfig({
                  token: spotifyTokenInput.trim(),
                  playlist: spotifyPlaylistInput.trim(),
                })
              }
              className="w-full rounded-lg bg-cyan-500/20 px-3 py-2 text-sm text-cyan-200"
            >
              Save Spotify Config
            </button>
            <p className="text-xs text-slate-400">
              Link-only playback works via embed. SDK controls require Spotify Premium + token scopes.
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 text-sm text-slate-300">
          <h3 className="mb-2 font-semibold text-slate-100">Current Focus</h3>
          <p>{activeTimerTask ? activeTimerTask.name : 'General Study Block'}</p>
          <p className="mt-1 text-xs text-slate-400">{activeTimerTask ? activeTimerTask.subject : 'General'}</p>
        </div>
      </section>
    </div>
  );
}

export default TimerPage;
