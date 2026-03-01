import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

function getWeekData(sessions) {
  const toLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const data = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const key = toLocalDateKey(day);
    const label = day.toLocaleDateString(undefined, { weekday: 'short' });
    const minutes = sessions
      .filter((session) => session.date.slice(0, 10) === key)
      .reduce((sum, session) => sum + Math.round(session.durationSeconds / 60), 0);
    data.push({ key, label, minutes });
  }
  return data;
}

function StatsPage() {
  const { state, level } = useAppContext();
  const tasksCompleted = state.tasks.filter((task) => task.completed).length;

  const weekData = useMemo(() => getWeekData(state.sessions), [state.sessions]);
  const maxWeekMinutes = Math.max(...weekData.map((item) => item.minutes), 1);

  const subjectData = useMemo(() => {
    const map = {};
    state.sessions.forEach((session) => {
      map[session.subject] = (map[session.subject] || 0) + Math.round(session.durationSeconds / 60);
    });
    return Object.entries(map)
      .map(([subject, minutes]) => ({ subject, minutes }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 6);
  }, [state.sessions]);

  const maxSubjectMinutes = Math.max(...subjectData.map((item) => item.minutes), 1);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lifetime Study Time" value={`${state.totalStudyMinutes} min`} />
        <StatCard label="Total XP" value={state.totalXp} />
        <StatCard label="Current Level" value={level} />
        <StatCard label="Tasks Completed" value={tasksCompleted} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="glass-panel p-4">
          <h3 className="mb-4 text-sm font-semibold text-slate-100">Weekly Study Time</h3>
          <div className="space-y-3">
            {weekData.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <span className="w-12 text-xs text-slate-400">{item.label}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{ width: `${Math.round((item.minutes / maxWeekMinutes) * 100)}%` }}
                  />
                </div>
                <span className="w-14 text-right text-xs text-slate-300">{item.minutes}m</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4">
          <h3 className="mb-4 text-sm font-semibold text-slate-100">Study Time by Subject</h3>
          <div className="space-y-3">
            {subjectData.length === 0 && <p className="text-sm text-slate-400">No sessions yet.</p>}
            {subjectData.map((item) => (
              <div key={item.subject} className="flex items-center gap-3">
                <span className="w-24 truncate text-xs text-slate-400">{item.subject}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
                    style={{ width: `${Math.round((item.minutes / maxSubjectMinutes) * 100)}%` }}
                  />
                </div>
                <span className="w-14 text-right text-xs text-slate-300">{item.minutes}m</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass-panel p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-cyan-100">{value}</p>
    </div>
  );
}

export default StatsPage;
