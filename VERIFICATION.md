# Verification record

Local checks performed November 4, 2026. This record describes evidence from
development; it does not mark the production acceptance test complete.

| Check | Result |
| --- | --- |
| GitHub source | Published under the connected owner's `Smuxie/cox-mill-leadership` public repository |
| Production build | `pnpm build` passed with static output |
| Automated tests | `pnpm test`: 28 passed, 0 failed |
| Event logic | Exact end-time transition, date-only midnight, 23/25-hour DST days, Eastern offsets, sorting/filtering, July school-year boundary tested |
| Content/security validation | Invalid dates, unsafe URL schemes/hosts, image traversal, required alt text, media size policy tested/validated |
| Authenticator | 9 tests, including CSRF, exact hostname allow list, forced public-repo scope, pinned source digest, and mocked GitHub code exchange |
| CMS compatibility | 5 tests for current content, blank optional numbers, Eastern widgets, required fields, nonsecret configure helper |
| CMS configuration schema | Installed Sveltia 0.258.1 schema: 0 validation errors |
| Browser homepage | Rendered correctly at desktop and 390-pixel mobile width; no horizontal document overflow |
| Mobile navigation | Menu expanded; Escape collapsed it and returned focus |
| Archive | Supplied October 2026 events appeared as past; category/year controls worked; oldest-first put King of the Court before Fall Spirit Week |
| Event details | King of the Court route rendered supplied facts and truthful missing-time/photo states |
| Calendar | List/calendar switching and next-month navigation worked |
| Editor application | Actual pinned Sveltia application initialized; sign-in/local-workflow controls rendered; no browser error or warning logged during initialization |
| Public static output | All internal links, local assets, CMS lazy modules, file-size/count limits, and absence of Pages Functions/Actions verified by build script |
| JavaScript parse checks | Site script, editor bootstrap, generated OAuth Worker parsed successfully |
| Production AI dependencies | No runtime AI integration, AI key, scheduled AI task, or AI endpoint in authored application code |
| Hosting | Public HTTPS Pages site returned HTTP 200 with the expected content and security headers |
| Account cost settings | Workers Free active; no payment method on file; GitHub Actions disabled |
| Simplified revision | Generic slogans/artwork removed; plain class description; eight current-year event records; multiple event Instagram links validated |
| Private planning material | No archive, original planning document, private media, roster or internal operational details copied into source or public output |

Screenshots of the checked homepage are supplied beside the source archive as
`preview-desktop.jpg` and `preview-mobile.jpg`. The owner-confirmed Instagram
profile was viewed in the browser and matching public post URLs were added.
The official script generated the profile iframe in the preview, but the
third-party iframe content did not finish rendering there. Direct links remained
available. Visual verification of the feed in the deployed visitor browser is
still required; a successful oEmbed response alone does not prove rendering.

## Still pending — required for launch

- Register the GitHub OAuth app; store its secret in the Free Worker, set exact
  allowed hostnames, and configure the real site/authentication URLs.
- Invite a student account, sign in as that student, save/upload/publish and
  delete approved test content, and verify matching Git commits and Pages builds.
- Confirm an uninvited account cannot write or publish.
- Confirm the profile feed and selected event embeds render in the deployed
  visitor browser; direct fallback links are already present.
- Check actual school-approved photos, all permission/consent requirements, and
  final advisor contact details before publication.

The embedded preview browser did not surface a local directory picker after
“Work with Local Repository.” A real local filesystem save was therefore **not
verified**. Production GitHub publishing is a different workflow and must be
tested with the real configured accounts. Mocked OAuth, a rendered editor login
screen, and schema checks do not substitute for that test.

Follow the live acceptance checklist in `DEPLOYMENT.md` and record its actual
commit SHA, deployment ID, account plan evidence, and student publisher result
before calling the project fully deployed or the $0 account boundary verified.
