function ProgressBar({ label, value, max, subtitle, color = 'emerald' }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  const colorClass = {
    emerald: 'from-emerald-400 to-green-500',
    cyan: 'from-cyan-300 to-blue-500',
    amber: 'from-amber-300 to-orange-500',
  }[color] || 'from-emerald-400 to-green-500';

  return (
    <div className="glass-panel p-4">
      <div className="mb-2 flex items-end justify-between gap-4">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
