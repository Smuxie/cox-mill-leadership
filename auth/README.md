# Free GitHub authentication for the student editor

The public Astro site is completely static. This separate, small OAuth Worker
runs only when an editor signs in. It has no scheduled jobs, database, storage
bindings, AI calls, or paid seats. It is based on the upstream MIT-licensed
[Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth), with
provenance in `UPSTREAM.md`.

Deploy it to **Workers Free**, in the website owner's Cloudflare account. Free
Workers currently stop at 100,000 daily requests with an error; this is not an
instruction to enable Workers Paid. If the account already uses Workers Paid,
do not deploy here until it is on Free or a separate Free account is established.
An alert or paid CPU limit is not an enforceable zero-dollar billing limit.

Deployment choices:

1. Dashboard: run `node auth/build.mjs`, create a Worker, and paste the complete
   `auth/worker.js` into its JavaScript editor. The included bundle is already
   generated. Keep the default free `workers.dev` hostname. Disable paid add-ons.
2. CLI: with Wrangler installed, run `wrangler deploy --config auth/wrangler.toml`.
   Wrangler bundles `src/index.js` and `src/upstream.js` automatically.

Configure three values in the Worker dashboard (Settings → Variables and Secrets):

| Name | Value | Type |
| --- | --- | --- |
| `ALLOWED_DOMAINS` | Your exact `PROJECT.pages.dev` hostname; no scheme or slash | Text |
| `GITHUB_CLIENT_ID` | Your GitHub OAuth application's client ID | Secret |
| `GITHUB_CLIENT_SECRET` | Your OAuth application's secret | Secret |

Use a GitHub OAuth application owned by the website owner, with callback
`https://YOUR-AUTH-WORKER.workers.dev/callback`. Save the client secret directly
into the Worker dashboard. Never put it in the repository, site settings, public
CMS configuration, this chat, or a command argument. Leave
`GITHUB_ALLOW_WORKFLOW_SCOPE` unset or `false`.

The included wrapper only permits exact production hostnames, forces GitHub's
`public_repo` scope and fails closed before configuration. Use a **public GitHub
repository**. This OAuth scope can access other public repositories the signing-in
editor can write; it is not restricted to this one repository. Use individual
student GitHub accounts dedicated to school work if appropriate. No student needs
the owner's credentials or Cloudflare access. GitHub repository Write access is
the authorization boundary, and also permits changes to source outside the CMS.

When adding a custom domain, update `ALLOWED_DOMAINS` to an exact comma-separated
list such as `project.pages.dev,leadership.example.org`. Do not use wildcards.
Update the public CMS site/domain configuration as described in `DEPLOYMENT.md`.

Run the local checks with `node --test auth/auth.test.mjs` from the project root.
They verify configuration guards, narrow scopes, CSRF and a mocked OAuth code
exchange. They do **not** prove that a real GitHub app is configured or a production
editor can publish. Complete the live acceptance steps in `DEPLOYMENT.md`.
