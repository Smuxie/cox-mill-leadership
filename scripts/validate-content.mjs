import fs from 'node:fs';
import { readJson, readCollection } from '../src/lib/content.mjs';
import { validateEvent, safeUrl, safeImage, instagramUrl, easternDateTime } from '../src/lib/validation.mjs';
const errors = [];
const assert = (ok, message) => { if (!ok) errors.push(message); };
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
const text = value => typeof value === 'string' && value.trim().length > 0;
const optionalText = value => value === undefined || value === null || typeof value === 'string';
const list = (value, name) => { assert(Array.isArray(value), `${name} must be a list`); return Array.isArray(value) ? value : []; };
const site = record(readJson('site'));
for (const key of ['schoolName','programName','description','tagline','footerMessage']) assert(text(site[key]), `site.${key} is required`);
const theme = record(site.theme);
for (const key of ['navy','accent','purple','background']) assert(typeof theme[key] === 'string' && /^#[\da-f]{6}$/i.test(theme[key]), `theme.${key} needs a six-digit hex color`);
assert(safeUrl(site.schoolUrl, { optional:false, internal:false }), 'site.schoolUrl needs an HTTPS URL');
assert(instagramUrl(site.instagramUrl), 'Invalid Instagram profile URL');
const hero = record(site.hero);
for (const key of ['eyebrow','headline','description','primaryLabel','secondaryLabel']) assert(text(hero[key]), `hero.${key} is required`);
assert(safeImage(hero.image), 'Hero image must be an uploaded image');
assert(!hero.image || text(hero.imageAlt), 'Hero image needs alternative text');
for (const key of ['primaryHref','secondaryHref']) assert(safeUrl(hero[key], { optional:false }), `Invalid hero.${key}`);
for (const [section, keys] of Object.entries({ mission: ['heading','description'], about: ['heading','intro','body','participation'], contact: ['intro','address','phone','opportunities'] })) {
  const fields = record(site[section]);
  for (const key of keys) assert(text(fields[key]), `${section}.${key} is required`);
}
const contact = record(site.contact);
assert(!contact.email || (typeof contact.email === 'string' && /^[A-Za-z0-9.!_+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(contact.email)), 'Invalid contact email');
const events = readCollection('events');
for (const event of events) {
  errors.push(...validateEvent(event, event.slug));
  for (const key of ['recap','results','coverAlt']) assert(optionalText(event[key]), `${event.slug}: ${key} must be text or empty`);
}
for (const raw of readCollection('announcements')) {
  const item = record(raw);
  assert(text(item.title) && text(item.body), `${item.slug}: announcement title/body required`);
  assert(['published','draft'].includes(item.status) && typeof item.featured === 'boolean', `${item.slug}: invalid announcement status/featured`);
  assert(!item.expiresAt || easternDateTime(item.expiresAt), `${item.slug}: expiration needs a real date/time with Eastern offset or Z`);
  assert(safeUrl(item.url), `${item.slug}: invalid URL`);
}
const posts = list(record(readJson('social')).posts, 'social.posts');
for (const raw of posts) {
  const post = record(raw);
  assert(text(post.url) && instagramUrl(post.url,true) && typeof post.pinned === 'boolean' && text(post.caption), 'Invalid Instagram post: URL, caption, and pinned flag required');
}
for (const raw of list(record(readJson('links')).links, 'links.links')) {
  const link = record(raw);
  assert(text(link.label) && safeUrl(link.url,{ optional:false }) && optionalText(link.description), 'Invalid quick link');
}
const members = list(record(readJson('team')).members, 'team.members');
for (const raw of members) {
  const person = record(raw);
  assert(text(person.name) && text(person.role) && safeImage(person.image) && (!person.image || text(person.imageAlt)) && optionalText(person.bio), 'Invalid team entry');
}
const images = [hero.image, ...events.flatMap(e => [e.cover,...(Array.isArray(e.gallery) ? e.gallery.map(i => record(i).src) : [])]), ...members.map(p => record(p).image)].filter(Boolean);
for (const src of images) {
  // Invalid image values were already reported; do not parse unsafe paths here.
  if (!safeImage(src)) continue;
  const file = new URL(`../public${src}`, import.meta.url);
  if (!fs.existsSync(file)) assert(false, `Missing image: ${src}`);
  else {
    const stat = fs.statSync(file);
    assert(stat.isFile(), `Image path is not a file: ${src}`);
    assert(stat.size <= 2 * 1024 * 1024, `Image exceeds the 2 MiB upload policy: ${src}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; } else console.log('Content validated: events, dates, links, media, settings.');
