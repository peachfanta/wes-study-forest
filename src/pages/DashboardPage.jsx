import { Link } from 'react-router-dom';
import ForestScene from '../components/ForestScene';
import ProgressBar from '../components/ProgressBar';
import { useAppContext } from '../context/AppContext';

function DashboardPage() {
  const { state, level, xpIntoLevel, todayMinutes } = useAppContext();

  const pendingTasks = state.tasks.filter((task) => !task.completed).slice(0, 5);

  return (
    <div className="space-y-5">
      <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <ForestScene totalXp={state.totalXp} />
          <div className="grid gap-4 md:grid-cols-2">
            <ProgressBar
              label={`Level ${level} Progress`}
              value={xpIntoLevel}
              max={500}
              subtitle={`${xpIntoLevel}/500 XP`}
              color="emerald"
            />
            <ProgressBar
              label="Daily Goal"
              value={todayMinutes}
              max={state.dailyGoalMinutes}
              subtitle={`${todayMinutes}/${state.dailyGoalMinutes} min`}
              color="cyan"
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass-panel p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Current XP</p>
            <p className="mt-1 text-3xl font-semibold text-emerald-300">{state.totalXp}</p>
            <Link
              to="/timer"
              className="mt-4 inline-block rounded-xl bg-emerald-500/20 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/30"
            >
              Quick Start Timer
            </Link>
          </div>

          <div className="glass-panel p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-200">Today's Tasks</h3>
            <ul className="space-y-2">
              {pendingTasks.length === 0 && <li className="text-sm text-slate-400">No pending tasks today.</li>}
              {pendingTasks.map((task) => (
                <li key={task.id} className="rounded-lg bg-slate-800/60 p-3 text-sm">
                  <p className="text-slate-100">{task.name}</p>
                  <p className="text-xs text-slate-400">{task.subject}</p>
                </li>
              ))}
            </ul>
            <Link to="/tasks" className="mt-3 inline-block text-xs text-cyan-300 hover:text-cyan-200">
              Manage all tasks
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default DashboardPage;
