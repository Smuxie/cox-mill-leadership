import test from 'node:test';
import assert from 'node:assert/strict';
import { validDate, localDate, easternMidnight, nextDate, eventStart, eventEnd, isUpcoming, schoolYear, selectEvents, announcementActive, formatTime } from '../src/lib/events.mjs';
import { safeUrl, instagramUrl, safeImage, offsetDateTime, easternDateTime, validateEvent } from '../src/lib/validation.mjs';

const event = overrides => ({ title: 'School event', description: 'An approved school event.', date: '2026-11-04', start: '', end: '', location: '', category: 'Service', status: 'published', featured: false, cover: '', coverAlt: '', gallery: [], registrationUrl: '', instagramUrl: '', attendance: null, fundraising: null, ...overrides });

test('calendar dates reject normalized dates and malformed values without throwing', () => {
  for (const value of ['2024-02-29','2026-11-04','2000-02-29','0001-01-01']) assert.equal(validDate(value), true, value);
  for (const value of ['2026-02-29','1900-02-29','2026-02-30','2026-13-01','2026-00-01','2026-01-00','2026-04-31','999999-12-31','2026-1-1','0000-01-01',null,{},1]) assert.equal(validDate(value), false, String(value));
  assert.equal(nextDate('2024-02-28'), '2024-02-29');
  assert.equal(nextDate('2026-12-31'), '2027-01-01');
  assert.throws(() => nextDate('2026-02-30'), /Invalid date/);
  assert.throws(() => nextDate('9999-12-31'), /outside the supported calendar/);
});

test('date-only events end at next Eastern midnight across 23 and 25 hour days', () => {
  assert.equal(new Date(easternMidnight('2026-03-08')).toISOString(), '2026-03-08T05:00:00.000Z');
  assert.equal(new Date(easternMidnight('2026-03-09')).toISOString(), '2026-03-09T04:00:00.000Z');
  assert.equal(eventEnd(event({date:'2026-03-08'})) - eventStart(event({date:'2026-03-08'})), 23 * 3600000);
  assert.equal(eventEnd(event({date:'2026-11-01'})) - eventStart(event({date:'2026-11-01'})), 25 * 3600000);
  assert.throws(() => easternMidnight('2026-13-01'), /Invalid date/);
});

test('events move to past exactly at the end, not at their start', () => {
  const timed = event({start:'2026-11-04T15:00:00-05:00',end:'2026-11-04T16:00:00-05:00'});
  const end = Date.parse(timed.end);
  assert.equal(isUpcoming(timed,end - 1),true);
  assert.equal(isUpcoming(timed,end),false);
  const untimed = event({date:'2026-11-04'});
  assert.equal(isUpcoming(untimed,Date.parse('2026-11-05T04:59:59.999Z')),true);
  assert.equal(isUpcoming(untimed,Date.parse('2026-11-05T05:00:00Z')),false);
});

test('UTC imports are categorized by Eastern date and displayed in Eastern time', () => {
  assert.equal(localDate('2026-11-05T02:00:00Z'),'2026-11-04');
  const utc = event({start:'2026-11-05T02:00:00Z',end:'2026-11-05T03:00:00Z'});
  assert.deepEqual(validateEvent(utc,'utc-event'),[]);
  assert.match(formatTime(utc.start),/9:00 PM EST/);
  assert.ok(validateEvent({...utc,date:'2026-11-05'},'utc-event').some(error => error.includes('date must match')));
});

test('school years change July 1; selection combines filters and hides drafts', () => {
  assert.equal(schoolYear('2026-06-30'),'2025–2026');
  assert.equal(schoolYear('2026-07-01'),'2026–2027');
  assert.throws(() => schoolYear('not-a-date'),/Invalid date/);
  const entries = [event({title:'July service',date:'2026-07-02'}),event({title:'June service',date:'2026-06-30'}),event({title:'July sport',date:'2026-07-03',category:'School spirit'}),event({title:'Draft',date:'2026-07-04',status:'draft'}),event({title:'Cancelled',date:'2026-07-05',status:'cancelled'})];
  assert.deepEqual(selectEvents(entries,{mode:'all',category:'Service',year:'2026–2027'}).map(e => e.title),['July service','Cancelled']);
  assert.equal(entries[0].title,'July service','sorting does not mutate the input list');
});

test('upcoming sorts ascending, archives descending, and tied starts sort by title', () => {
  const entries = [event({title:'Bravo',date:'2026-11-05'}),event({title:'Charlie',date:'2026-11-06'}),event({title:'Alpha',date:'2026-11-05'})];
  assert.deepEqual(selectEvents(entries,{now:Date.parse('2026-11-04T12:00:00Z')}).map(e => e.title),['Alpha','Bravo','Charlie']);
  assert.deepEqual(selectEvents(entries,{mode:'past',now:Date.parse('2026-11-10T12:00:00Z')}).map(e => e.title),['Charlie','Alpha','Bravo']);
  assert.deepEqual(selectEvents(entries,{mode:'past',order:'asc',now:Date.parse('2026-11-10T12:00:00Z')}).map(e => e.title),['Alpha','Bravo','Charlie']);
});

test('featured announcements expire exactly on the boundary and drafts stay hidden', () => {
  const item = {status:'published',featured:true,expiresAt:'2026-11-05T10:00:00-05:00'};
  const expiry = Date.parse(item.expiresAt);
  assert.equal(announcementActive(item,expiry-1),true);
  assert.equal(announcementActive(item,expiry),false);
  assert.equal(announcementActive({...item,status:'draft'},expiry-1),false);
  assert.equal(announcementActive({...item,featured:false},expiry-1),false);
  assert.equal(announcementActive({...item,expiresAt:''},expiry),true);
  assert.equal(announcementActive({...item,expiresAt:'invalid'},expiry),false);
});

test('timestamps need actual dates, valid clock values and bounded explicit offsets', () => {
  for (const value of ['2026-11-04T15:00Z','2026-11-04T15:00:12.123-05:00','2026-11-04T15:00+14:00']) assert.equal(offsetDateTime(value),true,value);
  for (const value of ['2026-02-30T15:00:00-05:00','2026-11-04T24:00:00-05:00','2026-11-04T15:60:00-05:00','2026-11-04T15:00:60-05:00','2026-11-04T15:00:00','2026-11-04T15:00+14:01','2026-11-04T15:00+25:00','2026-13-04T15:00Z',null]) assert.equal(offsetDateTime(value),false,String(value));
});

test('Eastern local timestamps reject wrong seasonal offsets and DST gaps', () => {
  for (const value of ['2026-07-01T19:00:00-04:00','2026-12-01T19:00-05:00','2026-11-01T01:30:00-04:00','2026-11-01T01:30:00-05:00','2026-03-08T03:00:00-04:00','2026-07-01T23:00:00Z']) assert.equal(easternDateTime(value),true,value);
  for (const value of ['2026-07-01T19:00:00-05:00','2026-12-01T19:00:00-04:00','2026-03-08T02:30:00-05:00','2026-03-08T02:30:00-04:00']) assert.equal(easternDateTime(value),false,value);
});

test('event validation checks duration, required structure, image descriptions and metrics', () => {
  assert.deepEqual(validateEvent(event({registrationUrl:null,instagramUrl:null,cover:null}),'valid-event'),[]);
  const errors = validateEvent(event({start:'2026-11-04T16:00-05:00',end:'2026-11-04T15:00-05:00',cover:'/uploads/photo.webp',coverAlt:'',gallery:[null,{src:'/uploads/other.jpg',alt:''}],attendance:-1,fundraising:Infinity,registrationUrl:'javascript:alert(1)'}),'Bad Slug');
  for (const fragment of ['filename','end must be after start','alternative text','gallery images','attendance','fundraising','registration URL']) assert.ok(errors.some(error => error.includes(fragment)),fragment);
  assert.ok(validateEvent(event({start:'2026-11-04T15:00-05:00'}),'event').some(error => error.includes('both start and end')));
  assert.ok(validateEvent(event({gallery:{}}),'event').some(error => error.includes('gallery must be a list')));
  assert.ok(validateEvent(null,'event').some(error => error.includes('must be an object')));
  assert.ok(validateEvent(event({start:'2026-11-04T15:00-04:00',end:'2026-11-04T16:00-04:00'}),'event').some(error => error.includes('correct Eastern offset')));
});

test('external URL validation rejects executable, credentialed and malformed destinations', () => {
  for (const url of ['https://example.org/path?q=ok#section','/events/','/events/#calendar','']) assert.equal(safeUrl(url),true,url);
  for (const url of ['javascript:alert(1)','data:text/html,test','http://example.com','//evil.example','/\\evil.example','https://user:secret@example.com','https:evil.example','https:///evil.example','https://example.com\n.evil.example','https://example.com/`x`']) assert.equal(safeUrl(url),false,url);
  assert.equal(safeUrl('/events/',{internal:false}),false);
  assert.equal(safeUrl('',{optional:false}),false);
  assert.equal(safeUrl(null),true);
  assert.equal(safeUrl(0),false);
});

test('Instagram validation uses exact hostnames and known post URL shapes', () => {
  assert.equal(instagramUrl('https://www.instagram.com/p/ABC-123_/?igsh=example',true),true);
  assert.equal(instagramUrl('https://instagram.com/reel/ABC_123/',true),true);
  assert.equal(instagramUrl('https://instagram.com/coxmill/'),true);
  for (const url of ['https://instagram.com.evil.example/p/ABC/','https://instagram.com@evil.example/p/ABC/','https://evil.example/instagram.com/p/ABC/','https://instagram.com:444/p/ABC/','https://instagram.com/stories/abc/','https://instagram.com/p/ABC/extra','https://instagram.com/p/ABC/\n']) assert.equal(instagramUrl(url,true),false,url);
});

test('upload paths reject traversal, encoded separators, SVG and malformed escapes', () => {
  for (const src of ['/uploads/event.webp','/uploads/2026/class%20photo.JPG','/uploads/team/group photo.png','',null]) assert.equal(safeImage(src),true,String(src));
  for (const src of ['https://example.org/photo.jpg','/images/photo.jpg','/uploads/../private.jpg','/uploads/%2e%2e/private.jpg','/uploads/%2f%2fevil.jpg','/uploads/%5cevil.jpg','/uploads/%00.jpg','/uploads/%ZZ.jpg','/uploads/photo.svg','/uploads/photo.jpg?script=1','/uploads//photo.jpg']) assert.equal(safeImage(src),false,src);
});
