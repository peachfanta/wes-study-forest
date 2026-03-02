const DAY_MAP = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

function unfoldLines(icsText) {
  const raw = icsText.replace(/\r\n/g, '\n').split('\n');
  const lines = [];

  raw.forEach((line) => {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  });

  return lines;
}

function parsePropLine(line) {
  const sepIndex = line.indexOf(':');
  if (sepIndex === -1) return null;

  const left = line.slice(0, sepIndex);
  const value = line.slice(sepIndex + 1).trim();
  const parts = left.split(';');
  const name = parts[0].toUpperCase();
  const params = {};

  parts.slice(1).forEach((part) => {
    const [k, v] = part.split('=');
    if (k && v) {
      params[k.toUpperCase()] = v;
    }
  });

  return { name, params, value };
}

function parseIcsDate(value) {
  if (!value) return null;

  if (/^\d{8}$/.test(value)) {
    const y = Number(value.slice(0, 4));
    const m = Number(value.slice(4, 6)) - 1;
    const d = Number(value.slice(6, 8));
    return new Date(y, m, d, 0, 0, 0, 0);
  }

  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
  if (!match) return null;

  const [, y, mo, d, h, mi, s = '00', z] = match;
  if (z) {
    return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)));
  }

  return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s), 0);
}

function parseRRule(raw) {
  if (!raw) return null;
  const entries = raw.split(';');
  const out = {};

  entries.forEach((entry) => {
    const [k, v] = entry.split('=');
    if (!k || !v) return;
    out[k.toUpperCase()] = v;
  });

  return out;
}

export function parseIcsEvents(icsText) {
  const lines = unfoldLines(icsText);
  const events = [];
  let current = null;

  lines.forEach((line) => {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      return;
    }

    if (line === 'END:VEVENT') {
      if (current?.dtstart) {
        const start = parseIcsDate(current.dtstart);
        if (!start || Number.isNaN(start.getTime())) {
          current = null;
          return;
        }
        const end = current.dtend ? parseIcsDate(current.dtend) : null;
        const durationMs = end && start ? Math.max(0, end.getTime() - start.getTime()) : 60 * 60 * 1000;

        events.push({
          uid: current.uid || crypto.randomUUID(),
          summary: current.summary || 'Untitled Class',
          location: current.location || '',
          start,
          end: end || new Date(start.getTime() + durationMs),
          durationMs,
          rrule: parseRRule(current.rrule),
        });
      }
      current = null;
      return;
    }

    if (!current) return;

    const prop = parsePropLine(line);
    if (!prop) return;

    if (prop.name === 'DTSTART') current.dtstart = prop.value;
    if (prop.name === 'DTEND') current.dtend = prop.value;
    if (prop.name === 'SUMMARY') current.summary = prop.value;
    if (prop.name === 'LOCATION') current.location = prop.value;
    if (prop.name === 'UID') current.uid = prop.value;
    if (prop.name === 'RRULE') current.rrule = prop.value;
  });

  return events.filter((event) => event.start instanceof Date && !Number.isNaN(event.start.getTime()));
}

function startOfWeekMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildOccurrence(baseDate, sourceStart, durationMs, sourceEvent, weekStart) {
  const start = new Date(baseDate);
  start.setHours(sourceStart.getHours(), sourceStart.getMinutes(), sourceStart.getSeconds(), 0);
  const end = new Date(start.getTime() + durationMs);

  return {
    id: `${sourceEvent.uid}-${start.toISOString()}`,
    summary: sourceEvent.summary,
    location: sourceEvent.location,
    start,
    end,
    durationMs,
    dayIndex: Math.round((startOfDay(start).getTime() - startOfDay(weekStart).getTime()) / (24 * 60 * 60 * 1000)),
  };
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekOccurrences(events, anchorDate = new Date()) {
  const weekStart = startOfWeekMonday(anchorDate);
  const weekEnd = addDays(weekStart, 7);
  const out = [];

  events.forEach((event) => {
    if (!event.start) return;

    if (event.rrule?.FREQ === 'WEEKLY') {
      const byDays = event.rrule.BYDAY ? event.rrule.BYDAY.split(',').map((d) => d.trim()) : [];
      const days = byDays.length > 0 ? byDays : Object.keys(DAY_MAP).filter((k) => DAY_MAP[k] === event.start.getDay());

      days.forEach((dayKey, i) => {
        const weekDay = DAY_MAP[dayKey];
        if (weekDay === undefined) return;
        const offset = weekDay === 0 ? 6 : weekDay - 1;
        const dayDate = addDays(weekStart, offset);
        const occurrence = buildOccurrence(dayDate, event.start, event.durationMs, event, weekStart);
        if (occurrence.start >= weekStart && occurrence.start < weekEnd) {
          out.push(occurrence);
        }
      });
      return;
    }

    if (event.start >= weekStart && event.start < weekEnd) {
      out.push({
        id: `${event.uid}-${event.start.toISOString()}`,
        summary: event.summary,
        location: event.location,
        start: event.start,
        end: event.end,
        durationMs: event.durationMs,
        dayIndex: Math.round((startOfDay(event.start).getTime() - startOfDay(weekStart).getTime()) / (24 * 60 * 60 * 1000)),
      });
    }
  });

  return out.sort((a, b) => a.start - b.start);
}

export function getTodayClasses(weekOccurrences, now = new Date()) {
  return weekOccurrences.filter((item) => sameDay(item.start, now)).sort((a, b) => a.start - b.start);
}

export function getNextClass(events, now = new Date()) {
  const nextCandidates = [];
  const weekStart = startOfWeekMonday(now);

  events.forEach((event) => {
    if (!event.start) return;

    if (event.rrule?.FREQ === 'WEEKLY') {
      const byDays = event.rrule.BYDAY ? event.rrule.BYDAY.split(',').map((d) => d.trim()) : [];
      const days = byDays.length > 0 ? byDays : Object.keys(DAY_MAP).filter((k) => DAY_MAP[k] === event.start.getDay());

      for (let w = 0; w < 3; w += 1) {
        const weekBase = addDays(weekStart, w * 7);
        days.forEach((dayKey) => {
          const weekDay = DAY_MAP[dayKey];
          if (weekDay === undefined) return;
          const offset = weekDay === 0 ? 6 : weekDay - 1;
          const baseDate = addDays(weekBase, offset);
          const occ = buildOccurrence(baseDate, event.start, event.durationMs, event, weekBase);
          if (occ.start > now) nextCandidates.push(occ);
        });
      }
      return;
    }

    if (event.start > now) {
      nextCandidates.push({
        id: `${event.uid}-${event.start.toISOString()}`,
        summary: event.summary,
        location: event.location,
        start: event.start,
        end: event.end,
      });
    }
  });

  nextCandidates.sort((a, b) => a.start - b.start);
  return nextCandidates[0] || null;
}

export function timeUntil(targetDate, now = new Date()) {
  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) return 'Now';

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function getDailyRefreshDelayMs(now = new Date()) {
  const next = new Date(now);
  next.setHours(24, 0, 3, 0);
  return Math.max(1000, next.getTime() - now.getTime());
}
