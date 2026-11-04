# Cox Mill Leadership

A static, responsive website for Cox Mill High School Leadership in Concord,
North Carolina. Repository: [Smuxie/cox-mill-leadership](https://github.com/Smuxie/cox-mill-leadership).
Leadership Instagram, confirmed by the owner:
[coxmill_leadership](https://www.instagram.com/coxmill_leadership/).

**Current status:** the public site is deployed at
[cox-mill-leadership.pages.dev](https://cox-mill-leadership.pages.dev).
GitHub Actions is disabled. Cloudflare billing was inspected: Workers Free is
active and no payment method is on file. Editor authentication and real
save/publish testing remain pending. `/admin/` deliberately explains the
remaining setup until the actual authentication URL is supplied. This is not a
claim of a completed live deployment.

## What is included

- Simple homepage with the class description, an official Instagram profile
  embed, selected posts, upcoming/past events, announcements, and school links.
- Upcoming list and monthly calendar, category filters, chronological sorting,
  and permanent event detail URLs.
- Archive with school-year/category filters, recaps, galleries, and optional metrics.
- About, optional approved team profiles, contact/involvement links, privacy page,
  and a custom 404 page. No form or student database.
- A real Sveltia CMS application at `/admin/`, JSON content in Git, image uploads,
  and a pinned self-hosted GitHub OAuth authenticator for individual student accounts.
- Centralized colors, accessible keyboard controls, responsive navigation, and
  reduced-motion support. Unprovided photographs are omitted; public Instagram
  embeds supply event and class-activity media.
- Deployment, student editing, ownership continuity, cost audit, and verification guides.

The archive includes eight completed 2026–2027 activities. Summaries use public
event facts; private planning documents, student information, internal logistics,
and attachments are excluded from the repository and deployed output. No
unconfirmed future events or older-school-year folders are imported.

## Run locally

Use Node.js 24 and pnpm 11.25.0. If pnpm is unavailable in a standard Node
installation, install it with `npm install --global pnpm@11.25.0`.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm preview
```

Open the printed localhost address. `pnpm dev` provides live frontend editing;
run `pnpm build` once first to prepare the CMS bundle. Never open `dist/index.html`
as a `file://` URL: the site uses normal absolute web paths.

```sh
pnpm test
node scripts/validate-content.mjs
```

Tests cover Eastern daylight saving changes, exact archive/expiration boundaries,
filtering and sorting, unsafe URLs/media, CMS content compatibility, configuration,
and the OAuth helper using mocked GitHub responses. See `VERIFICATION.md` for the
actual local results and the checks still requiring real accounts.

## Architecture

Astro 7 + Tailwind CSS 4 generate static HTML/CSS/JavaScript into `dist/`. There is
no frontend framework runtime, SSR adapter, database, background job, analytics,
payment handler, AI API, or GitHub Actions workflow. Plain JSON stores content:

```text
content/site.json             Homepage, About, contact, branding
content/events/*.json         Events, galleries, recaps, optional statistics
content/announcements/*.json  Featured notices and expiry
content/social.json           Selected Instagram posts
content/links.json            Approved resources and forms
content/team.json             Optional approved people
public/uploads/               Published school-approved media
public/admin/                 Static CMS and its public configuration
auth/                         Separate editor-login OAuth Worker
```

The visitor's browser places published events into upcoming/past lists from their
end time, refreshing while the page is open. No rebuild is required as dates pass.
Date-only events finish at the next midnight in `America/New_York`. Known start/end
times use explicit, validated timezone offsets. The browser clock must be accurate.
Without JavaScript, all published events remain linked with their dates, and a
notice explains that the dynamic filters and automatic grouping are unavailable.
School years run July 1–June 30.

The CMS is pinned and bundled locally. A few optional editor features can load
upstream UNPKG resources; the public website does not use them. Sveltia is pre-1.0
software, so updates require deliberate review. Third-party notices and licenses
are included.

## Production setup

Follow [DEPLOYMENT.md](DEPLOYMENT.md). Use the existing public GitHub repository,
Cloudflare Pages **Free** with its native Git integration, and a separate
Cloudflare Workers **Free** login helper. Do not enable a paid Worker account,
paid products, or a payment method for this project. The strict $0 behavior
depends on the real account configuration, not a flag in the code.

| Cloudflare Pages setting | Value |
| --- | --- |
| Repository / branch | `Smuxie/cox-mill-leadership` / `main` |
| Build command | `pnpm build` |
| Output | `dist` |
| Build environment | `NODE_VERSION=24`, `PNPM_VERSION=11.25.0`, `ASTRO_TELEMETRY_DISABLED=1` |
| Hosting | Pages Free, no Functions |

After Pages and the authentication Worker exist, run:

```sh
node scripts/configure-cms.mjs --owner Smuxie --repo cox-mill-leadership --site https://YOUR-PROJECT.pages.dev --auth https://YOUR-AUTH-WORKER.workers.dev
```

Only public names/URLs enter that file. Store the GitHub OAuth client secret only
as an encrypted Worker secret. The GitHub callback is the Worker's `/callback`.
Use exact allowed production hostnames and the public-repository OAuth scope.

Students use their own invited GitHub accounts and publish without routine owner
approval. Personal-repository collaborators can also edit source code; this is
not a content-only role. You remain responsible for inviting replacement editors
and owner-level account recovery. GitHub/Cloudflare ownership stays under your
accounts, as requested.

The official Instagram profile embed displays Instagram's own profile content
without an API token, scheduled job, AI, or paid widget. It can stay current as
the account publishes. Visitors choose to load Instagram content. Event pages
contain explicitly matched public post/reel embeds; new event pages are not
automatically inferred from captions. No scraping is used. Embedding can be
blocked by Meta settings or a visitor's browser, so direct links remain available.

## Operating guides

- [STUDENT_ADMIN_GUIDE.md](STUDENT_ADMIN_GUIDE.md): edit and publish without coding.
- [COST_AUDIT.md](COST_AUDIT.md): current free limits, billing boundaries, account checks.
- [OWNERSHIP_HANDOFF.md](OWNERSHIP_HANDOFF.md): keep ownership and maintain student access.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): decisions, sources, and tradeoffs.
- [auth/README.md](auth/README.md): self-hosted authentication deployment.

Use a free `pages.dev` address initially. Custom-domain hosting is supported;
buying or renewing a domain can cost money and is not part of this setup.
