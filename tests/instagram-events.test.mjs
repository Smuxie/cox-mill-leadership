import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEvent } from '../src/lib/validation.mjs';
import { readFileSync } from 'node:fs';
const event=JSON.parse(readFileSync(new URL('../content/events/king-of-the-court-2026.json',import.meta.url),'utf8'));
test('event embeds accept several official posts and reject malformed destinations',()=>{
  const valid={...event,instagramPosts:[{url:'https://www.instagram.com/p/OfficialPost_1/',caption:'Event announcement'},{url:'https://www.instagram.com/reel/OfficialReel-2/',caption:''}]};
  assert.deepEqual(validateEvent(valid,'king-of-the-court-2026'),[]);
  for(const instagramPosts of [{},[{url:'https://instagram.com.attacker.example/p/OfficialPost_1/'}],[{url:'javascript:alert(1)'}],[{url:'https://www.instagram.com/p/OfficialPost_1/',caption:{html:'unsafe'}}]])assert.ok(validateEvent({...valid,instagramPosts},'king-of-the-court-2026').length>0);
});
