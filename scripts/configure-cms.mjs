import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Public configuration only. Never supply an OAuth secret or access token here.
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(project, 'public/admin/config.json');
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => {
  if (index % 2 === 0) {
    if (!value.startsWith('--') || !values[index + 1]) throw new Error('Use --owner NAME --repo NAME --site HTTPS_URL --auth HTTPS_URL');
    pairs.push([value.slice(2), values[index + 1]]);
  }
  return pairs;
}, []));
if (Object.keys(args).some(key => !['owner', 'repo', 'site', 'auth'].includes(key))) throw new Error('Unknown option. Only --owner, --repo, --site and --auth are accepted.');
for (const key of ['owner', 'repo', 'site', 'auth']) if (!args[key]) throw new Error(`Missing --${key}`);
if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$/.test(args.owner)) throw new Error('Invalid GitHub owner.');
if (!/^[a-zA-Z0-9._-]+$/.test(args.repo) || args.repo === '.' || args.repo === '..') throw new Error('Invalid repository name.');
const site = new URL(args.site);
const auth = new URL(args.auth);
for (const [label, url] of [['site', site], ['auth', auth]]) {
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error(`${label} must be a root HTTPS origin, without credentials, path, query or fragment.`);
}
const config = JSON.parse(await readFile(configPath, 'utf8'));
config.backend.repo = `${args.owner}/${args.repo}`;
config.backend.base_url = auth.origin;
config.backend.site_domain = site.hostname;
config.site_url = site.origin;
config.display_url = site.origin;
await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
console.log('CMS public settings saved. No credentials were requested or saved.');
console.log(`Set the authenticator ALLOWED_DOMAINS to: ${site.hostname}`);
console.log(`Register the GitHub OAuth callback as: ${auth.origin}/callback`);
console.log('Commit this config and redeploy. Finish the real editor publishing test in DEPLOYMENT.md.');
