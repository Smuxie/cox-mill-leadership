# Upstream source provenance

`src/upstream.js` is the unmodified Sveltia CMS Authenticator implementation from
[sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth), pinned to
commit `33500e16141793d4be3d878abb9733658069f5b7` on November 4, 2026.

SHA-256: `b28b0446a3ea7cd28eca9d242a425dddbca7fbede38bb7197dda2969fee572a1`.
The upstream MIT license is included as `LICENSE.txt`.

Our separate `src/index.js` wrapper requires exact allowed hostnames, forces
GitHub `public_repo` scope, disables workflow scope, and adds no-store/security
headers. It deliberately supports public repositories only. The source exchanges
OAuth codes only during sign-in; public website visits do not invoke it.

Review upstream releases periodically before updating the pinned source. Run
`node --test auth/auth.test.mjs` from the project root after any change.
