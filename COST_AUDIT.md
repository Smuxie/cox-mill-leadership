# Cost audit

Reviewed: November 4, 2026. Target recurring cost: **$0 using a `pages.dev` address**.

The connected GitHub account was verified as `Smuxie` with administrator access to the intended public repository; Actions was disabled in repository settings. The public Pages deployment succeeded. The Cloudflare subscriptions screen showed **Workers Free: Active** and **No payment method on file** on November 4, 2026. Editor authentication and a real student login → publish → deployment test remain pending. This records observed settings at that time; it cannot prevent the owner changing account plans later. See `DEPLOYMENT.md` for the setup and acceptance record.

Free plans can change. This project prevents normal site activity from invoking paid products under the configuration below; it cannot promise a third party will provide free service forever. If a provider changes its terms, keep the site on a free plan, accept restrictions, or move the static files rather than enable billing.

## Services and limits

| Service | What this project uses | Current free limits and failure behavior | Billing information / possible charges | Required protection |
| --- | --- | --- | --- | --- |
| Cloudflare Pages Free | Static HTML, CSS, JavaScript, images; native Git builds | 500 builds/month, one concurrent build, 20 minute build timeout; 20,000 files/site; 25 MiB/file; 100 custom domains/project. Oversized or over-limit deployments must wait or fail; no automatic upgrade is configured. | The selected Free service is $0. No payment method is needed for this design. Paid plan changes are separate owner actions. | Use Pages Free, `dist` output, no Pages Functions or SSR adapter. Keep photographs small. Do not enable R2, Images, paid transformations, or paid plans. |
| Cloudflare Workers Free | A separate Sveltia OAuth authenticator, invoked only during editor login | Account-wide 100,000 requests/day, reset at midnight UTC; 10 ms CPU/request. Free request exhaustion returns error 1027; resource exhaustion can stop authentication. Published pages remain available. | Workers Paid is a different account subscription with a minimum charge and usage charges. A Worker deployed into an already-paid Workers account is **not protected by the Free quota**. | Confirm the **account** is on Workers Free before deploying. If the existing account is paid, use a separate personal Free account for authentication or do not deploy it. No storage bindings, cron, AI, or paid products. |
| GitHub Free | A public personal repository, individual collaborators, OAuth app, normal Git/API operations | Unlimited public/private repositories and collaborators. API rate limits can temporarily prevent CMS reads/writes. Large-file and repository limits still apply. | Repository collaboration has no per-editor charge on Free. Actions, Packages, Codespaces, LFS, and other products have separate billing rules and are not part of this site. | Disable Actions for this repository in Settings → Actions → General. Do not enable LFS, Packages, Codespaces, or paid add-ons. Use Cloudflare's native Git integration. |
| Sveltia CMS and Sveltia CMS Authenticator | Open-source software; local CMS bundle and pinned authenticator source | No hosted CMS subscription, seat allowance, or trial. Each editor needs their own authorized GitHub account. | Software is free under its upstream license. Cloudflare hosts the authenticator as described above. | Retain licenses, lock dependencies, review updates deliberately. No hosted authentication subscription. |
| Editor-only public CDN requests | Optional Sveltia syntax-highlighting resources can be loaded from UNPKG when that feature is used | Third-party availability can affect optional editor features. The CMS application and its normal lazy chunks are bundled locally. | No CDN account, API credential, or subscription is configured. Visitors to public pages do not load these editor resources. | Keep the npm-based CMS build. Avoid adding remote media services; use plain text fields when optional highlighting is unavailable. |
| Instagram | Visitor-initiated official profile/feed and post/reel embeds | Instagram serves current profile content. Availability depends on Meta, public visibility, embed settings, network restrictions, and the visitor's browser. Plain links remain useful if an embed fails. | No paid feed widget, Meta API key, billing account, AI call, or recurring feed job is configured. | Never scrape or add access tokens to browser code. Keep event-to-post associations in the CMS. |
| Domain / DNS | Free provider address initially; optional existing custom domain later | Provider address is included. DNS and HTTPS setup for an existing supported domain can use free hosting features. | Registering or renewing a domain can cost money. No domain is purchased by this project. | Keep `pages.dev` for a strict $0 budget. Do not enable domain purchase or renewal without separate explicit authorization. |
| npm / development dependencies | Packages downloaded during development and Cloudflare builds | Packages are bundled into static output; visitors do not run a package installation or build. | No paid registry or package subscription configured. | Keep the lockfile; avoid paid build services. |
| OpenAI / ChatGPT / Codex | Development only | No production usage. No runtime key, AI endpoint, agent, or scheduled AI task is needed. | Canceling ChatGPT does not stop the site or CMS. | Never add an AI binding or API credential to production. |

Cloudflare's [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) document the build and asset limits. Requests for static Pages assets are free and unlimited when no Function is invoked, according to [Pages pricing](https://developers.cloudflare.com/pages/functions/pricing/). The authenticator's Free quota and error behavior are in [Workers limits](https://developers.cloudflare.com/workers/platform/limits/); the distinction between Free and Paid is in [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/). GitHub documents [free unlimited collaborators](https://docs.github.com/en/get-started/learning-about-github/types-of-github-accounts). Sveltia publishes the [CMS](https://github.com/sveltia/sveltia-cms) and [authenticator](https://github.com/sveltia/sveltia-cms-auth) as open-source software.

Sveltia's current [Getting Started guide](https://sveltiacms.app/en/docs/start) identifies the CMS as beta, with possible changes before version 1.0. This project pins version 0.258.1 and vendors a specific authenticator commit. Updates require deliberate review and a fresh login/save/deployment check; pinning avoids automatically accepting upstream changes but does not eliminate long-term maintenance.

## Enforcing the $0 boundary

There is no project setting that can overrule an account owner deliberately buying a paid service. Cloudflare CPU limits and billing alerts on a paid account are not a verified total $0 spending cap. The protection here is to stay on Free products whose quotas stop work, with no upgrade, payment method, or usage-billed resource added for this project.

Before launch, the owner must record evidence for each item below. Do not mark an item verified just because a configuration file says it should be true.

- [ ] GitHub repository is on the intended personal account; Actions is disabled; no LFS, Packages, or Codespaces dependency exists.
- [ ] Cloudflare Pages project is Free and connected only to this repository.
- [ ] Authenticator's Cloudflare account is Workers Free, including if it differs from the Pages account.
- [ ] No project billing method, paid subscription, or nonzero spending allowance was created. Review account subscriptions for existing paid Workers usage before deploying authentication.
- [ ] No Functions, `_worker.js`, SSR adapter, R2, KV, D1, Durable Objects, Queues, cron triggers, paid Images, or AI bindings are present in the site deployment. The separate auth Worker is the sole server component.
- [ ] The OAuth app requests the configured public-repository scope and no workflow scope. The repository stays public; moving it private requires a scope and security review.
- [ ] Student editors have GitHub collaborator access only, with no Cloudflare billing/admin access.
- [ ] A student can publish an approved test edit; Cloudflare deploys it; the account usage page still shows Free with no new paid product.
- [ ] No custom domain was purchased. Public settings contain no secrets.

The CMS cannot purchase Cloudflare products or change billing because it has no Cloudflare API credentials. Normal editing can consume build quota or repository storage, resulting in a paused publishing workflow. GitHub collaborators have code write access and could alter the project, so the owner should disable Actions at repository level and periodically review changes. Their CMS access is not a security boundary around source files.

## Exceeding a limit

If builds are exhausted, leave the current deployment online and publish less often until the quota resets. If files are too large, compress or remove them and republish. Do not solve these limits by enabling a paid storage service. If login hits the Worker Free quota, wait for the daily reset; do not upgrade. GitHub rate limiting similarly requires waiting and retrying.

## Independence result

The deployed public site and editor do not require Kyle's computer, ChatGPT subscription, Codex, an OpenAI key, or an AI job. Kyle's GitHub and Cloudflare accounts remain the ownership and recovery dependencies by choice. He is still needed for personal-repository collaborator invitations and owner-level recovery. Once admitted, students publish ordinary edits without Kyle approving each change.

Actual production acceptance is **pending account setup and end-to-end verification**. Never describe authentication or automatic deployment as production-tested until the owner has completed the launch record.
