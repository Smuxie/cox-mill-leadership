import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, mkdtemp, writeFile, rm, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { validateEvent } from '../src/lib/validation.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(await readFile(path.join(project,'public/admin/config.json'),'utf8'));
const collection = name => config.collections.find(item=>item.name===name);
const field = (fields,name) => fields.find(item=>item.name===name);

test('existing announcements can be reopened and saved with their internal links', async () => {
  const linkField = field(collection('announcements').fields,'url');
  const pattern = new RegExp(linkField.pattern[0]);
  for (const filename of await readdir(path.join(project,'content/announcements'))) {
    if (!filename.endsWith('.json')) continue;
    const entry = JSON.parse(await readFile(path.join(project,'content/announcements',filename),'utf8'));
    assert.ok(pattern.test(entry.url ?? ''), `${filename}: editor rejects its existing link`);
  }
  assert.ok(pattern.test('/about/'));
  assert.ok(pattern.test('https://example.org/signup'));
  assert.ok(pattern.test(''));
  assert.equal(pattern.test('//attacker.example'),false);
  assert.equal(pattern.test('javascript:alert(1)'),false);
});

test('blank optional number fields from the CMS remain valid event content', async () => {
  const event = JSON.parse(await readFile(path.join(project,'content/events/king-of-the-court-2026.json'),'utf8'));
  const fields = collection('events').fields;
  for (const name of ['attendance','fundraising']) {
    assert.equal(field(fields,name).required,false);
    assert.ok(['int','float'].includes(field(fields,name).value_type));
    event[name]=null; // Documented Sveltia output for blank optional numbers.
  }
  for (const name of ['start','end','cover','coverAlt','registrationUrl','instagramUrl','recap','results']) event[name]='';
  event.gallery=[];
  assert.deepEqual(validateEvent(event,'king-of-the-court-2026'),[]);
});

test('editor dates preserve Eastern offsets and date-only events', () => {
  const fields = collection('events').fields;
  assert.equal(field(fields,'date').type,'date');
  for (const name of ['start','end']) {
    assert.equal(field(fields,name).input_timezone,'America/New_York');
    assert.equal(field(fields,name).output_utc,false);
    assert.equal(field(fields,name).required,false);
  }
  const expiration=field(collection('announcements').fields,'expiresAt');
  assert.equal(expiration.input_timezone,'America/New_York');
  assert.equal(expiration.required,false);
});

test('required school website and gallery fields prevent incomplete entries', async () => {
  const site = JSON.parse(await readFile(path.join(project,'content/site.json'),'utf8'));
  const settings=collection('site').files[0].fields;
  const school=field(settings,'schoolUrl');
  assert.equal(school.required,true);
  const schoolPattern=new RegExp(school.pattern[0]);
  assert.ok(schoolPattern.test(site.schoolUrl));
  assert.equal(schoolPattern.test(''),false);
  const gallery=field(collection('events').fields,'gallery');
  assert.equal(field(gallery.fields,'src').required,true);
  assert.notEqual(field(gallery.fields,'alt').required,false);
});

test('configuration helper stores only public repo and URL values', async () => {
  const temporary=await mkdtemp(path.join(tmpdir(),'cox-mill-cms-test-'));
  try {
    await mkdir(path.join(temporary,'scripts'));
    await mkdir(path.join(temporary,'public/admin'),{recursive:true});
    const script=path.join(temporary,'scripts/configure-cms.mjs');
    const target=path.join(temporary,'public/admin/config.json');
    await writeFile(script,await readFile(path.join(project,'scripts/configure-cms.mjs')));
    await writeFile(target,JSON.stringify(config));
    execFileSync(process.execPath,[script,'--owner','StudentOwner','--repo','leadership','--site','https://leadership.pages.dev','--auth','https://leadership-auth.example.workers.dev'],{stdio:'pipe'});
    const result=JSON.parse(await readFile(target,'utf8'));
    assert.equal(result.backend.repo,'StudentOwner/leadership');
    assert.equal(result.backend.base_url,'https://leadership-auth.example.workers.dev');
    assert.equal(result.backend.site_domain,'leadership.pages.dev');
    assert.equal(result.site_url,'https://leadership.pages.dev');
    assert.equal(result.backend.auth_scope,'public_repo');
    assert.deepEqual(result.backend.auth_methods,['oauth']);
    const before=await readFile(target,'utf8');
    for (const args of [
      ['--owner','StudentOwner','--repo','leadership','--site','http://leadership.pages.dev','--auth','https://auth.workers.dev'],
      ['--owner','StudentOwner','--repo','leadership','--site','https://leadership.pages.dev','--auth','https://secret@auth.workers.dev'],
      ['--owner','StudentOwner','--repo','leadership'],
      ['--owner','StudentOwner','--repo','leadership','--site','https://leadership.pages.dev','--auth','https://auth.workers.dev','--token','must-not-save'],
    ]) assert.throws(()=>execFileSync(process.execPath,[script,...args],{stdio:'pipe'}));
    assert.equal(await readFile(target,'utf8'),before,'Invalid configuration must not change the file');
  } finally {
    const root=path.resolve(tmpdir())+path.sep;
    if (!path.resolve(temporary).startsWith(root) || !path.basename(temporary).startsWith('cox-mill-cms-test-')) throw new Error('Unsafe temporary cleanup target');
    await rm(temporary,{recursive:true,force:true});
  }
});
