import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import worker from './src/index.js';

const env = { ALLOWED_DOMAINS: 'leadership.pages.dev', GITHUB_CLIENT_ID: 'test-client', GITHUB_CLIENT_SECRET: 'test-secret' };
const auth = (query='') => new Request(`https://cms-auth.workers.dev/auth?provider=github&site_id=leadership.pages.dev${query}`);

test('pinned upstream content matches its documented SHA-256', async () => {
  const source = await readFile(new URL('./src/upstream.js', import.meta.url));
  assert.equal(createHash('sha256').update(source).digest('hex'), 'b28b0446a3ea7cd28eca9d242a425dddbca7fbede38bb7197dda2969fee572a1');
});
test('unset, wildcard and placeholder domains fail closed', async () => {
  for (const ALLOWED_DOMAINS of ['', '*.pages.dev', 'setup-required.invalid']) {
    const response=await worker.fetch(auth(),{...env,ALLOWED_DOMAINS});
    assert.equal(response.status,503);
    assert.equal(response.headers.get('Cache-Control'),'no-store');
  }
});
test('other providers are disabled', async () => {
  const response=await worker.fetch(new Request('https://cms-auth.workers.dev/auth?provider=gitlab'),env);
  assert.equal(response.status,400);
});
test('an unrelated site cannot use the authenticator', async () => {
  const response=await worker.fetch(new Request('https://cms-auth.workers.dev/auth?provider=github&site_id=attacker.example'),env);
  assert.equal(response.headers.get('Location'),null);
  assert.match(await response.text(),/UNSUPPORTED_DOMAIN/);
});
test('sign-in narrows requested scope and sets CSRF cookie', async () => {
  const response=await worker.fetch(auth('&scope=repo,workflow'),{...env,GITHUB_ALLOW_WORKFLOW_SCOPE:'true'});
  assert.equal(response.status,302);
  const target=new URL(response.headers.get('Location'));
  assert.equal(target.origin,'https://github.com');
  assert.equal(target.searchParams.get('scope'),'public_repo');
  assert.equal(target.searchParams.get('client_id'),'test-client');
  assert.match(target.searchParams.get('state'),/^[a-f0-9]{32}$/);
  const cookie=response.headers.get('Set-Cookie');
  assert.match(cookie,/HttpOnly/);
  assert.match(cookie,/SameSite=Lax/);
  assert.match(cookie,/Secure/);
  assert.ok(cookie.includes(target.searchParams.get('state')));
  assert.equal(response.headers.get('Cache-Control'),'no-store');
});
test('missing GitHub app credentials do not redirect to GitHub', async () => {
  const response=await worker.fetch(auth(),{...env,GITHUB_CLIENT_SECRET:''});
  assert.equal(response.headers.get('Location'),null);
  assert.match(await response.text(),/MISCONFIGURED_CLIENT/);
});
test('callback rejects a forged CSRF state before token exchange', async () => {
  const originalFetch=globalThis.fetch;
  globalThis.fetch=()=>{throw new Error('Must not exchange any token');};
  try {
    const response=await worker.fetch(new Request('https://cms-auth.workers.dev/callback?code=abc&state=forged',{headers:{Cookie:`csrf-token=github_${'a'.repeat(32)}`}}),env);
    assert.match(await response.text(),/CSRF_DETECTED/);
  } finally {globalThis.fetch=originalFetch;}
});
test('successful callback exchanges a code and limits delivery to trusted origins', async () => {
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async (url,options)=>{
    assert.equal(url,'https://github.com/login/oauth/access_token');
    assert.equal(options.method,'POST');
    const body=JSON.parse(options.body);
    assert.equal(body.client_secret,'test-secret');
    assert.equal(body.code,'test-code');
    return Response.json({access_token:'test-user-oauth-token'});
  };
  try {
    const state='a'.repeat(32);
    const response=await worker.fetch(new Request(`https://cms-auth.workers.dev/callback?code=test-code&state=${state}`,{headers:{Cookie:`csrf-token=github_${state}`}}),env);
    const html=await response.text();
    assert.match(html,/test-user-oauth-token/);
    assert.match(html,/isTrusted\(origin\)/);
    assert.match(html,/leadership/);
    assert.match(html,/authorization:github:success/);
    assert.match(response.headers.get('Set-Cookie'),/Max-Age=0/);
    assert.equal(response.headers.get('Cache-Control'),'no-store');
  } finally {globalThis.fetch=originalFetch;}
});
test('unknown routes return 404', async () => {
  assert.equal((await worker.fetch(new Request('https://cms-auth.workers.dev/'),env)).status,404);
});
