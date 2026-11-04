# Deploy under your accounts for $0

The latest ownership instruction takes precedence: you keep the personal GitHub
repository and Cloudflare account. Students receive their own GitHub access.
No ChatGPT, Codex, OpenAI API key, or always-running computer is used in production.

Source is published in `Smuxie/cox-mill-leadership` under the connected owner account.
No Cloudflare project, OAuth application, or paid plan has been created by this
codebase. The following one-time steps require the owner's signed-in accounts. Real login,
publishing and deployment must pass the live checklist before launch.

## 1. Verify the account plans

Use GitHub Free and Cloudflare Pages Free. For the separate authentication Worker,
verify **Workers Free** in Cloudflare's billing/subscriptions dashboard. Do not
enable Workers Paid, R2, Images, D1, paid logs, paid add-ons or billing information.
On an existing paid account, a free allowance is not a $0 spending cap; resolve
that account state before deployment. Read `COST_AUDIT.md` for current limits and
the remaining account verification checklist.

## 2. Put this project in a public GitHub repository

The owner supplied the existing, empty **public** repository
`https://github.com/Smuxie/cox-mill-leadership`. Upload or push
the contents of this folder to its root, including the lockfile. Do not include
`node_modules`, `dist`, credentials or local environment files. The public repository
must never contain student private information, private contact data or photos
without school permission.

Use `main` as the production branch. The simple CMS workflow commits to `main`
directly. Branch protections that block student pushes will also block CMS saves.
Do not give students your password. In repository Settings → Collaborators, invite
each editor's own GitHub account and have them accept. Personal repositories do
not provide a content-only editor permission: collaborators can also change source.
Only invite trusted authorized students. The owner alone retains billing access.

In repository Settings → Actions → General, disable Actions for this repository.
This site does not need an Actions workflow. Do not enable Git LFS or paid storage.

## 3. Create the static Cloudflare Pages project

In Cloudflare, choose Workers & Pages → Create → **Pages** → Connect to Git.
Choose GitHub and authorize access to this repository only. Choose your repository,
`main`, and the Astro framework preset. Configure:

| Setting | Value |
| --- | --- |
| Root directory | Repository root |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Node version environment variable | `NODE_VERSION=24` |
| pnpm version environment variable | `PNPM_VERSION=11.25.0` |
| Optional build telemetry setting | `ASTRO_TELEMETRY_DISABLED=1` |

Commit the pnpm lockfile. Use Pages' native Git integration and automatic builds.
This project does not include a `functions/` directory, `_worker.js`, SSR adapter,
or Workers runtime for public page requests. Deploy the production branch and
copy the free `https://PROJECT.pages.dev` URL. Disable unnecessary preview branch
builds to conserve the free build allowance. Public visitors should require no
Cloudflare/ChatGPT login.

## 4. Deploy the free editor authenticator

Follow `auth/README.md` to deploy the supplied ready-to-paste `auth/worker.js` to
**Workers Free**. It returns 503 before its domain restrictions are configured.
After configuration, `/` returns 404; the supported sign-in endpoint is `/auth`.
The Worker is separate from Pages.

Open [GitHub's new OAuth app form](https://github.com/settings/applications/new).
Set a clear application name such as Cox Mill Leadership Editor, your Pages URL as
the homepage, and `https://YOUR-WORKER.workers.dev/callback` as the callback.
Register it under your personal account. Copy the client ID and create a client
secret. Save both as Worker secrets, then set `ALLOWED_DOMAINS` to your exact
`PROJECT.pages.dev` hostname. Save and redeploy the Worker.

The CMS uses `public_repo` scope for this public repository. Do not switch the
repository to private without revisiting the authentication design. OAuth tokens
remain in the editor's browser storage; sign out on shared computers. The client
secret remains inside the Worker and must never appear in public configuration.

## 5. Connect the editor's public settings

From the project folder, run (replace each example):

```sh
node scripts/configure-cms.mjs --owner Smuxie --repo cox-mill-leadership --site https://PROJECT.pages.dev --auth https://YOUR-WORKER.workers.dev
```

This command only saves public names and URLs into `public/admin/config.json`.
It does not request or store any secret. Commit that file and push to `main`.
Wait for the successful Pages build. The production editor is now at `/admin/`.
Before configuration it deliberately displays setup instructions and offers no
pretend production login.

## 6. Required live acceptance test

Complete these steps in the real deployed environment and record the date,
account roles, commit SHA and Pages deployment ID. Local or mocked checks are
not substitutes for this test.

1. In a browser signed into an invited student's GitHub account, open `/admin/`
   and choose Sign In with GitHub. Authorize the OAuth app and verify access.
2. Confirm an uninvited account cannot open the repository for writing or publish.
3. Create a draft test event, save it, and verify the corresponding JSON commit
   appears on GitHub. Verify drafts stay off public pages.
4. Upload an approved test photograph and add descriptive alternative text. Save.
5. Set the event's visibility to published and save. Confirm the native Pages Git
   integration creates a new successful deployment containing the changed commit.
6. Open the public site in a signed-out browser. Confirm the event, image, details,
   category filtering, mobile navigation and timezone display. Delete the test
   event afterward. Verify the deletion also deploys.
7. Edit a homepage sentence, save, and confirm the public page changes after build.
   Restore it and verify the correction deploys without the owner's approval.
8. Add a real public Instagram post URL and verify consent-based embed loading,
   direct fallback link, and the profile link. Embeds can be unavailable for posts
   with privacy, geography or account restrictions; the fallback must remain usable.
9. Confirm the Pages production URL and editor both work with the original
   developer's computer off. No production request should call an AI service.
10. Recheck billing: Pages Free, Workers Free, no paid products, no Actions jobs,
    no payment method added by this setup. Student editor accounts have no access
    to the owner's Cloudflare billing.

## Custom domain later

The `pages.dev` URL needs no purchased domain. To use a domain already owned by
you or the school, open Pages → Custom domains → Set up a custom domain. Follow
Cloudflare's exact DNS instructions. Apex domains require the zone on Cloudflare;
a subdomain can point by CNAME to `PROJECT.pages.dev` after being associated in
the Pages dashboard. Wait for domain validation and automatic HTTPS issuance.
Keep the free URL working while verifying the new one.

Add the exact new hostname to the authenticator's `ALLOWED_DOMAINS`, rerun the
configuration command with the new `--site`, commit, and redeploy. Test login and
publishing again from the new hostname. Changing the site domain does not change
the OAuth callback unless the Worker URL changes. Domain registration/renewal may
cost money; this setup never purchases a domain or enables auto-renewal.

## Recovery and limits

If a build fails, Pages keeps the last successful deployment online. Check its
build log, fix the content entry or revert the bad Git commit, and push again.
For a serious issue, roll back in Pages' Deployments menu, then fix Git so the next
build does not reintroduce it. An advisor with repository Write access can perform
this using GitHub's browser interface.

If the Pages build allowance is exhausted, published static pages remain usable;
new content waits until allowance resets or a build is available. If the free
authenticator request quota is exhausted, new sign-ins fail temporarily rather
than upgrading a Workers Free account. Keep free plans: do not upgrade to restore
service without explicit owner authorization.

Official references checked November 4, 2026:
[Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/),
[Pages limits](https://developers.cloudflare.com/pages/platform/limits/),
[Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/),
[Workers limits](https://developers.cloudflare.com/workers/platform/limits/),
[Sveltia GitHub backend](https://sveltiacms.app/en/docs/backends/github).
