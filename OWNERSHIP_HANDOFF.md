# Ownership and annual handoff

Kyle retains the personal GitHub repository and Cloudflare project. Future students use individual GitHub accounts and the browser editor at `/admin/`; they never use Kyle's password, session, personal access token, ChatGPT account, or Codex account. Routine publishing does not need his approval after access is granted.

## What ownership still requires

A personal GitHub repository has one owner and collaborators, rather than content-only roles. The owner invites and removes collaborators; collaborators can write both content and code. This setup cannot give an advisor the power to admit future students while withholding repository ownership. These are [GitHub's personal-repository permissions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository).

Kyle must remain available for annual invitations and owner-level recovery. If independent annual access management later becomes necessary, he can establish a GitHub organization under his control and give an advisor an appropriate repository administration role after reviewing its permissions. That is an optional ownership change, not something this project performs automatically.

## Establish access before graduation

1. Complete `DEPLOYMENT.md` under the selected personal GitHub and Cloudflare Free accounts. Keep account recovery methods current and enable two-factor authentication.
2. Put an advisor and at least two approved student editors on the repository's collaborator list. Each accepts their own invitation.
3. Keep the Cloudflare GitHub app installed for this repository. Students need no Cloudflare access to edit content. Avoid granting billing or plan-management access.
4. Keep the GitHub OAuth application under the selected owner account. Store its client secret only as an encrypted Cloudflare Worker secret. Record the app's settings URL and Worker name in a private school/owner runbook, never in public content.
5. Set the authenticator's allowed domains to the exact live site hostname. Follow `DEPLOYMENT.md`; do not use an unrestricted wildcard.
6. Have an editor log in, change approved content, publish it, and confirm the live deployment. Record the result and tested accounts without recording secrets.
7. Give the advisor `STUDENT_ADMIN_GUIDE.md`, this guide, and a working recovery contact. Replace any contact placeholder before launch.

## Each school year

1. The advisor identifies the next approved editors. Kyle invites their individual GitHub accounts as collaborators.
2. Each editor accepts, signs in at `/admin/`, and publishes a small approved change. Confirm it appears on the live website.
3. The outgoing class updates the About page, current roles, links, and active announcements. Archive historical events; do not delete old school years.
4. Obtain appropriate school permission before publishing names or photographs. The repository is public, including version history. Removing a file from the latest site does not erase its old commits.
5. Remove departing editors from the GitHub collaborator list. They should also revoke the site's OAuth authorization in their own GitHub settings and sign out of shared devices. Review active access with the advisor.
6. Recheck `COST_AUDIT.md` and current provider terms. Stay on Free; accept publishing restrictions rather than enable a paid service.

## Instagram ownership

Use the leadership program's approved Instagram account. Verify the correct handle with the advisor before adding it to Site settings. Account credentials never enter the CMS or site source. Editors paste public post URLs; no Instagram token is required by this implementation. Instagram account administration and recovery should follow school policy independently of website access.

If the profile becomes private, removes a post, or disables embedding, remove or replace the selected URL. The site's events and announcements remain independent of Instagram.

## Domain ownership

The free `pages.dev` address is the default. No registration or renewal is needed for that address. If an existing custom domain is later connected, record the registrar, renewal owner, DNS account, expiry, and recovery contact privately. A paid domain is outside the $0 operating configuration. Connecting a school-controlled subdomain is possible without transferring the repository.

## Recovery and rollback

For a content mistake, edit it in `/admin/` and republish. For a broken deployment, an authorized owner can restore a previous successful Cloudflare Pages deployment, then fix or revert the Git commit so future builds preserve the repair. Git history is the content backup; keep periodic repository downloads in an approved location. Neither recovery route uses AI.

If login fails, first check GitHub collaborator access, popup blocking, the configured site domain, the OAuth callback, and Worker Free quota. Only the owner should inspect or rotate the Worker secret. Never send a secret to a student or paste one into chat.

## Optional later transfer

No transfer is required now. If Kyle later authorizes school ownership:

1. Arrange a school GitHub organization and at least two permanent staff administrators; review the target Free plan and repository permissions.
2. Transfer the repository using GitHub's transfer process, then update the configured repository name and Cloudflare Git integration.
3. Recreate or transfer the OAuth application as supported by GitHub; set the new callback and rotate credentials in the authenticator. Retest with a student before removing the former app.
4. Establish the school Cloudflare account on Free. If moving Pages requires a new project, deploy and verify it before changing DNS. Update the CMS origin allow list and configured addresses.
5. Transfer or update custom-domain registration/DNS only if a domain exists and the registrar permits it.
6. Verify login, upload, publishing, deployment, rollback, and $0 configuration using school accounts. Remove Kyle's access only after all checks pass.

Transferring accounts without retesting authentication and deployment is not a complete handoff. The current personal ownership model remains an intentional dependency, even though daily operation does not require Kyle's involvement.
