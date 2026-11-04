export const TIME_ZONE = 'America/New_York';
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
export function validDate(value) {
  if (typeof value !== 'string' || !datePattern.test(value) || value.startsWith('0000-')) return false;
  const timestamp = Date.parse(`${value}T12:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}
export function localDate(timestamp) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(timestamp));
  const part = type => parts.find(p => p.type === type).value;
  return `${part('year').padStart(4, '0')}-${part('month')}-${part('day')}`;
}
export function easternMidnight(date) {
  if (!validDate(date)) throw new Error(`Invalid date: ${date}`);
  const target = Date.parse(`${date}T00:00:00Z`);
  let guess = target + 5 * 3600000;
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(guess);
    const n = type => Number(parts.find(p => p.type === type).value);
    // Date.UTC treats years 0–99 as 1900–1999; an ISO string preserves the year.
    const displayed = Date.parse(`${String(n('year')).padStart(4, '0')}-${String(n('month')).padStart(2, '0')}-${String(n('day')).padStart(2, '0')}T${String(n('hour')).padStart(2, '0')}:${String(n('minute')).padStart(2, '0')}:${String(n('second')).padStart(2, '0')}Z`);
    guess += target - displayed;
  }
  return guess;
}
export function nextDate(date) {
  if (!validDate(date)) throw new Error(`Invalid date: ${date}`);
  const next = new Date(Date.parse(`${date}T12:00:00Z`) + 86400000).toISOString().slice(0, 10);
  if (!validDate(next)) throw new Error(`Date is outside the supported calendar: ${date}`);
  return next;
}
export function eventStart(event) { return event.start ? Date.parse(event.start) : easternMidnight(event.date); }
export function eventEnd(event) { return event.end ? Date.parse(event.end) : easternMidnight(nextDate(event.date)); }
export function isUpcoming(event, now = Date.now()) { return eventEnd(event) > now; }
export function schoolYear(date) { if (!validDate(date)) throw new Error(`Invalid date: ${date}`); const [year, month] = date.split('-').map(Number); const start = month >= 7 ? year : year - 1; return `${start}–${start + 1}`; }
export function visibleEvents(events) { return events.filter(e => e.status !== 'draft'); }
export function selectEvents(events, { mode = 'upcoming', now = Date.now(), category = '', year = '', order } = {}) {
  return visibleEvents(events).filter(e => (mode === 'all' || isUpcoming(e, now) === (mode === 'upcoming')) && (!category || e.category === category) && (!year || schoolYear(e.date) === year)).sort((a, b) => ((order || (mode === 'past' ? 'desc' : 'asc')) === 'desc' ? -1 : 1) * (eventStart(a) - eventStart(b)) || a.title.localeCompare(b.title));
}
export function announcementActive(item, now = Date.now()) { return item.status === 'published' && item.featured && (!item.expiresAt || Date.parse(item.expiresAt) > now); }
export function formatDate(date, options = {}) { return new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, month: 'long', day: 'numeric', year: 'numeric', ...options }).format(new Date(`${date}T12:00:00Z`)); }
export function formatTime(timestamp) { return new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(timestamp)); }
