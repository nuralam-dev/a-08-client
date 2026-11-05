# Production authentication findings — November 5, 2026

## Root cause and limits

The working copy of `src/lib/auth.ts` had an existing uncommitted edit that removed the MongoDB adapter import and `database` option. It constructed an unused MongoClient and bypassed the validated base URL and trusted origins. This is a confirmed local defect: BetterAuth was no longer configured to persist users and sessions in the intended MongoDB database. The fix restores `mongodbAdapter(db, { client })`, `baseURL: authBaseURL`, and the exact validated `trustedOrigins` list.

The historical `Invalid origin` error is consistent with an earlier mismatched allowlist, but it is not reproducible on the supplied production origin now. Current Vercel Production has the exact ruby frontend origin in both `BETTER_AUTH_URL` and `AUTH_TRUSTED_ORIGINS`. Do not assume older topaz/deployment-specific domains in historical notes are current approvals. The current deployment is not proven to contain the broken working-copy edit.

Production auth secret presence and minimum length were verified without printing it. A read-only ping to the configured frontend auth database succeeded. Express `/health` independently reports its database connected. This proves connectivity, not successful production signup or cookie persistence.

## Actual deployed requests

| Request | Status | Result |
| --- | --- | --- |
| Frontend GET /api/auth/get-session without cookies | 200 | null |
| POST /api/auth/sign-in/email with a fake account, approved origin | 401 | Invalid email or password |
| POST /api/auth/sign-up/email with deliberately invalid email/password | 400 | Validation error; no account created |
| POST signin with an untrusted origin | 403 | Invalid origin |
| Backend GET /health | 200 | database connected |

Headless Chrome submitted the deployed login form with a fake account, confirmed same-origin `/api/auth/sign-in/email` returned 401, and verified the actual credential error appeared. A browser fetch from the registration page with invalid data returned 400. No real credentials were used, and no account was created or MongoDB data deleted.

## Changes and verification

- `src/lib/auth.ts`: restores MongoDB persistence and validated origin settings; email/password remains enabled; private secret validation, JWT plugin, CSRF and secure host-only cookies remain intact.
- `src/app/api/auth/[...all]/route.ts`: uncaught configuration/infrastructure errors return safe JSON 503; BetterAuth status codes such as 400, 401 and 403 pass through unchanged.
- `src/lib/auth-error.ts` and `src/components/auth/AuthForm.tsx`: display actual client errors; service failures and rate limits have distinct messages; no generic invalid-credentials fallback for unknown failures and no raw auth exception logging in the browser.
- `scripts/check-auth.cjs`: uses the supplied production domains with isolated memory storage, tests signup/signin/session cookies, exact origins, JWT claims, dashboard protection, and the actual Next.js backend handler forwarding a verified JWT and session cookie. Browser-supplied authorization is replaced. Foreign mutation origins are rejected. No database connection or writes occur in this suite.
- Deployment documentation now uses the supplied stable production domains.

See [the current environment checklist](vercel-environment.md) for exact values and manual completion. No commit, push, deployment, secret update, project creation, or database deletion was performed.

Completed checks: `node scripts/check-auth.cjs`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, and `git diff --check` all passed. The build used unchanged local environment files and verifies compilation, not production authentication. Production network and browser results above were tested separately. The temporary environment download used for the read-only audit was removed.

The configuration follows BetterAuth's [MongoDB adapter](https://better-auth.com/docs/adapters/mongodb), [options](https://better-auth.com/docs/reference/options), and [security](https://better-auth.com/docs/reference/security) documentation.
