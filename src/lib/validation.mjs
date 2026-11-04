import { validDate, localDate, TIME_ZONE } from './events.mjs';
const empty = value => value === '' || value === null || value === undefined;
const text = value => typeof value === 'string' && value.trim().length > 0;
export function safeUrl(url, { optional = true, internal = true } = {}) {
  if (empty(url)) return optional;
  if (typeof url !== 'string' || /[\s\\\u0000-\u001f\u007f-\u009f<>"`]/.test(url)) return false;
  if (internal && /^\/(?!\/)/.test(url)) return true;
  if (!/^https:\/\/[^/]/i.test(url)) return false;
  try { const u = new URL(url); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
}
export function instagramUrl(url, post = false) {
  if (empty(url)) return true;
  if (!safeUrl(url, { optional: false, internal: false })) return false;
  try { const u = new URL(url); return ['www.instagram.com', 'instagram.com'].includes(u.hostname) && !u.port && (post ? /^\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?$/.test(u.pathname) : /^\/[A-Za-z0-9_.]+\/?$/.test(u.pathname)); } catch { return false; }
}
export function safeImage(src) {
  if (empty(src)) return true;
  if (typeof src !== 'string' || !/^\/uploads\/[A-Za-z0-9_./% -]+\.(png|jpe?g|webp|gif|avif)$/i.test(src)) return false;
  try {
    const decoded = decodeURIComponent(src);
    return !decoded.includes('..') && !decoded.includes('//') && !/[\\\u0000-\u001f\u007f-\u009f]/.test(decoded) && !/%(?:2f|5c)/i.test(src);
  } catch { return false; }
}
export function offsetDateTime(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || !validDate(match[1])) return false;
  const [, , hour, minute, second, , offset] = match;
  if (Number(hour) > 23 || Number(minute) > 59 || Number(second || 0) > 59) return false;
  if (offset !== 'Z') {
    const [hours, minutes] = offset.slice(1).split(':').map(Number);
    if (hours > 14 || minutes > 59 || (hours === 14 && minutes !== 0)) return false;
  }
  return Number.isFinite(Date.parse(value));
}
export function easternDateTime(value) {
  if (!offsetDateTime(value)) return false;
  // Z is an unambiguous imported instant. Local editor values must use the real
  // Eastern offset, so a nonexistent spring-forward time cannot slip through.
  if (value.endsWith('Z')) return true;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date(value));
  const part = name => parts.find(p => p.type === name).value.padStart(name === 'year' ? 4 : 2, '0');
  const local = `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}`;
  return local === (value[16] === ':' ? value.slice(0, 19) : `${value.slice(0, 16)}:00`);
}
export function validateEvent(event, slug) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(`${slug}: ${message}`); };
  if (!event || typeof event !== 'object' || Array.isArray(event)) return [`${slug}: event must be an object`];
  require(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), 'filename must be a lowercase hyphenated slug');
  for (const key of ['title','description','date','category']) require(text(event[key]), `${key} is required`);
  require(empty(event.location) || typeof event.location === 'string', 'location must be text');
  require(validDate(event.date), 'date must be a real YYYY-MM-DD date');
  require(event.date !== '9999-12-31' || Boolean(event.end), 'date-only event needs a date before 9999-12-31');
  require(['published','draft','cancelled'].includes(event.status), 'invalid status');
  require(typeof event.featured === 'boolean', 'featured must be boolean');
  require(Boolean(event.start) === Boolean(event.end), 'provide both start and end, or leave both blank');
  for (const key of ['start','end']) if (!empty(event[key])) require(easternDateTime(event[key]), `${key} needs a real ISO date/time with the correct Eastern offset (or Z)`);
  if (offsetDateTime(event.start) && offsetDateTime(event.end)) {
    require(Date.parse(event.end) > Date.parse(event.start), 'end must be after start');
    require(localDate(Date.parse(event.start)) === event.date, 'date must match the start date in America/New_York');
  }
  require(safeImage(event.cover), 'cover must be an uploaded image');
  require(!event.cover || text(event.coverAlt), 'cover alternative text is required');
  require(safeUrl(event.registrationUrl), 'registration URL must be HTTPS or a local link');
  require(instagramUrl(event.instagramUrl, true), 'invalid Instagram post URL');
  require(Array.isArray(event.gallery), 'gallery must be a list');
  for (const image of Array.isArray(event.gallery) ? event.gallery : []) require(image && safeImage(image.src) && Boolean(image.src) && text(image.alt), 'gallery images need valid paths and alternative text');
  for (const key of ['attendance','fundraising']) require(event[key] === null || event[key] === undefined || (typeof event[key] === 'number' && Number.isFinite(event[key]) && event[key] >= 0), `${key} must be a nonnegative number or empty`);
  return errors;
}
