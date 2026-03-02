import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getDailyRefreshDelayMs,
  getNextClass,
  getTodayClasses,
  getWeekOccurrences,
  parseIcsEvents,
  timeUntil,
} from '../utils/ics';

const STORAGE_KEY = 'study-forest-calendar-ics-url';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(date) {
  return date.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CalendarPage() {
  const [icsUrlInput, setIcsUrlInput] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [activeIcsUrl, setActiveIcsUrl] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [rawEvents, setRawEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());

  const fetchCalendar = useCallback(async (url) => {
    if (!url) {
      setRawEvents([]);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Fetch failed (${response.status})`);
      }

      const text = await response.text();
      const events = parseIcsEvents(text);
      setRawEvents(events);
      if (events.length === 0) {
        setError('No classes found in this ICS file.');
      }
    } catch (err) {
      setError(
        `Unable to load ICS. Ensure URL is public and CORS-enabled. ${err.message || ''}`.trim()
      );
      setRawEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendar(activeIcsUrl);
  }, [activeIcsUrl, fetchCalendar]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeIcsUrl) return undefined;

    const delay = getDailyRefreshDelayMs(new Date());
    const timeout = setTimeout(() => {
      fetchCalendar(activeIcsUrl);
    }, delay);

    return () => clearTimeout(timeout);
  }, [activeIcsUrl, rawEvents.length, fetchCalendar]);

  const weekOccurrences = useMemo(() => getWeekOccurrences(rawEvents, now), [rawEvents, now]);
  const todayClasses = useMemo(() => getTodayClasses(weekOccurrences, now), [weekOccurrences, now]);
  const nextClass = useMemo(() => getNextClass(rawEvents, now), [rawEvents, now]);

  const byDay = useMemo(() => {
    const dayBuckets = Array.from({ length: 7 }, () => []);
    weekOccurrences.forEach((item) => {
      if (item.dayIndex >= 0 && item.dayIndex < 7) {
        dayBuckets[item.dayIndex].push(item);
      }
    });

    dayBuckets.forEach((list) => list.sort((a, b) => a.start - b.start));
    return dayBuckets;
  }, [weekOccurrences]);

  const handleImport = () => {
    const trimmed = icsUrlInput.trim();
    setActiveIcsUrl(trimmed);
    localStorage.setItem(STORAGE_KEY, trimmed);
  };

  return (
    <div className="space-y-5">
      <section className="glass-panel p-4">
        <h2 className="mb-3 text-lg font-semibold text-slate-100">Calendar Import</h2>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="url"
            value={icsUrlInput}
            onChange={(e) => setIcsUrlInput(e.target.value)}
            placeholder="https://example.com/timetable.ics"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleImport}
            className="rounded-xl bg-cyan-500/20 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-500/30"
          >
            Import ICS
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Auto-refresh runs daily after midnight. If your URL blocks CORS, browser fetch will fail.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-panel p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Today's Classes</h3>
          {loading && <p className="text-sm text-slate-400">Loading timetable...</p>}
          {!loading && error && <p className="text-sm text-rose-300">{error}</p>}
          {!loading && !error && todayClasses.length === 0 && (
            <p className="text-sm text-slate-400">No classes scheduled for today.</p>
          )}
          <div className="space-y-2">
            {todayClasses.map((item) => (
              <div key={item.id} className="rounded-xl bg-slate-900/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-100">{item.summary}</p>
                  <p className="text-xs text-cyan-200">
                    {formatTime(item.start)} - {formatTime(item.end)}
                  </p>
                </div>
                {item.location && <p className="mt-1 text-xs text-slate-400">{item.location}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Next Class</h3>
          {!nextClass && <p className="text-sm text-slate-400">No upcoming classes found.</p>}
          {nextClass && (
            <div className="rounded-xl bg-slate-900/70 p-3">
              <p className="text-sm font-semibold text-emerald-200">{nextClass.summary}</p>
              <p className="mt-1 text-xs text-slate-300">{formatDateTime(nextClass.start)}</p>
              {nextClass.location && <p className="mt-1 text-xs text-slate-400">{nextClass.location}</p>}
              <p className="mt-3 rounded-lg bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200">
                Starts in: {timeUntil(nextClass.start, now)}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="glass-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">Weekly Timetable</h3>
          <span className="text-xs text-slate-400">Monday to Sunday</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {DAY_NAMES.map((day, index) => (
            <div key={day} className="rounded-xl border border-slate-800 bg-slate-900/60 p-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-200">{day}</p>
              <div className="space-y-2">
                {byDay[index].length === 0 && <p className="text-xs text-slate-500">No classes</p>}
                {byDay[index].map((item) => (
                  <div key={item.id} className="rounded-lg bg-slate-800/70 p-2">
                    <p className="truncate text-xs font-medium text-slate-100">{item.summary}</p>
                    <p className="text-[11px] text-slate-400">
                      {formatTime(item.start)} - {formatTime(item.end)}
                    </p>
                    {item.location && <p className="truncate text-[11px] text-slate-500">{item.location}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CalendarPage;
