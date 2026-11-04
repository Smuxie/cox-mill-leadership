import upstream from './upstream.js';

// The upstream implementation is unmodified and pinned in UPSTREAM.md.
// Fail closed on missing domain restrictions and force the smallest GitHub
// OAuth scope needed for this PUBLIC repository. No databases or storage.
export default {
  async fetch(request, env) {
    const domains = (env.ALLOWED_DOMAINS ?? '').split(',').map(value => value.trim()).filter(Boolean);
    if (!domains.length || domains.some(value => value.includes('*') || value.includes('setup-required') || !/^[a-zA-Z0-9.-]+$/.test(value))) {
      return new Response('Authentication needs its allowed production hostname.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
    const url = new URL(request.url);
    if (['/auth', '/oauth/authorize'].includes(url.pathname)) {
      if (url.searchParams.get('provider') !== 'github') return new Response('Only GitHub sign-in is enabled.', { status: 400 });
      url.searchParams.set('scope', 'public_repo');
      request = new Request(url, request);
    }
    const response = await upstream.fetch(request, { ...env, GITHUB_ALLOW_WORKFLOW_SCOPE: 'false' });
    const hardened = new Response(response.body, response);
    hardened.headers.set('Cache-Control', 'no-store');
    hardened.headers.set('Referrer-Policy', 'no-referrer');
    hardened.headers.set('X-Content-Type-Options', 'nosniff');
    hardened.headers.set('X-Frame-Options', 'DENY');
    return hardened;
  },
};
