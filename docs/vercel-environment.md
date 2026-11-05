# StudioSpace Vercel environment setup

BetterAuth runs in the **Next.js frontend**, at `/api/auth`. Express serves facilities and bookings. Keep those two addresses separate.

Browser requests deliberately use the relative `/api/backend` route. The Next.js server reads the Express origin from `BACKEND_URL`, or from `NEXT_PUBLIC_API_URL` when that override is absent. It retrieves BetterAuth JWTs server-side and forwards them to Express in JWT mode. Changing browser calls to the remote Express URL would bypass this existing flow and would prevent the frontend's host-only session cookie from reaching the API on another domain.

## Local files

- Frontend: use `.env.local`. The existing `.env` remains a fallback and was not overwritten. Do not replace an existing secret with the example placeholder.
- Backend: keep the existing `.env`. Merge only missing variables from its `.env.example`.
- Both repositories ignore `.env*`, with an exception for the safe `.env.example` templates.
- The examples enable `API_AUTH_MODE=jwt`. Set the same mode and audience on both apps. Existing environment files were not changed to enable JWT automatically; installations using session mode continue to work.

Next.js gives `.env.local` priority over `.env`. Do not put contradictory URLs in those files. `BETTER_AUTH_URL` and `NEXT_PUBLIC_AUTH_URL`, when both present, must name the same frontend origin.

## Exact frontend Vercel variables

Set these in the **frontend Vercel project's Production environment**, then rebuild. Replace the domain and private-value placeholders with your own values:

```dotenv
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.vercel.app
NEXT_PUBLIC_AUTH_URL=https://YOUR-FRONTEND.vercel.app
BETTER_AUTH_URL=https://YOUR-FRONTEND.vercel.app
BETTER_AUTH_SECRET=your-existing-private-random-secret-at-least-32-characters
MONGODB_URI=your-private-production-auth-database-connection
API_AUTH_MODE=jwt
JWT_AUDIENCE=studiospace-api
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-private-google-client-secret
```

`BACKEND_URL` is an optional **server-only override**. If you already use it, set it to `https://YOUR-BACKEND.vercel.app` too, or remove it from Vercel so `NEXT_PUBLIC_API_URL` takes effect. Never leave a development override in Production. Google variables are required for Google login; both may remain unset only when Google login is not being used.

Only the two `NEXT_PUBLIC_*` values above are public. MongoDB credentials, the BetterAuth secret, Google secrets, and signing keys must never use that prefix. Public values are normally baked into the client at build time, so redeploy/rebuild after changing them. [Next.js environment-variable documentation](https://nextjs.org/docs/app/guides/environment-variables)

## Exact backend Vercel variables

Set these in the **backend Vercel project's Production environment**:

```dotenv
CLIENT_URL=https://YOUR-FRONTEND.vercel.app
AUTH_BASE_URL=https://YOUR-FRONTEND.vercel.app
MONGODB_URI=your-private-production-studio-database-connection
API_AUTH_MODE=jwt
JWT_AUDIENCE=studiospace-api
```

`AUTH_BASE_URL` defaults to the configured frontend origin. It must point at Next.js, not Express. `CLIENT_ORIGIN` remains a legacy fallback when `CLIENT_URL` is missing. Prefer `CLIENT_URL` for new deployments. `PORT=4000` is a local-development setting; Vercel manages the deployed HTTP listener. Express exports its app, and the local listener runs only outside Vercel. The backend's existing `vercel.json` maps routes to `index.js`. [Express on Vercel](https://vercel.com/docs/frameworks/backend/express)

Do not copy the frontend's BetterAuth secret or Google secret into the backend: Express uses public JWKS and the existing session-verification endpoint. The JWT issuer and JWKS address are derived from `AUTH_BASE_URL`; no separate hardcoded issuer/JWKS URL is needed. `JWT_AUDIENCE` must match exactly on both projects. Use Node.js 22 or 24 in both Vercel projects; the installed Next.js and MongoDB packages require Node.js 20.9+ and 20.19+ respectively. [Vercel Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

## Google callback

In the Google Cloud OAuth client, authorize:

```text
https://YOUR-FRONTEND.vercel.app/api/auth/callback/google
```

Keep the local callback `http://localhost:3000/api/auth/callback/google` for development. The production callback is derived from the configured BetterAuth frontend URL. It is not hardcoded into the login form.

## Intentional local and fixed addresses

- `http://localhost:3000`: development-only auth/frontend defaults and documentation.
- `http://localhost:4000`: development-only Express/JWT audience defaults and documentation.
- `mongodb://127.0.0.1:27017/...`: safe local database examples, never production credentials.
- Loopback names/IPs in validation code: used to reject them in production, not as request targets.
- `https://studiospace.local` in login redirect validation: a fixed parsing origin used to reject external redirects. No network request is sent there; making it deployment-dependent is unnecessary.
- Social links, documentation links, and image URL placeholders are not API/auth base URLs.

No WebSocket connection URLs were found. Page components contain no direct localhost API calls. Featured Facilities and Facility Details use the server URL utility; All Facilities, Add/Manage Facilities, Booking Form, My Bookings, and Delete Booking retain the same-origin API route.

## Remaining deployment setup

Actual Vercel domains were not provided, so this work does not verify a deployed login or API. Before deployment, supply the production variables above, configure Google credentials/callbacks, and allow the deployed services to connect to MongoDB. Do not use the example local MongoDB URI on Vercel. If Vercel Deployment Protection restricts the auth frontend, Express must still be able to reach `/api/auth/get-session` and `/api/auth/jwks`; otherwise authentication fails closed.

Use matching frontend URLs in BetterAuth, the public SDK configuration, and backend CORS/auth settings. Do not add wildcard trusted origins or a shared `.vercel.app` cookie domain. Existing HTTP-only, Secure production cookies and ownership checks are retained. Preview deployments need their own matching frontend URL configuration and OAuth redirect registration if Google login is tested there.

## Verification completed for this change

- Frontend `npx tsc --noEmit`: passed.
- Frontend production build with placeholder HTTPS Vercel domains and JWT mode: passed, including its TypeScript check.
- ESLint for the changed frontend source files: passed.
- Full `npm run lint`: failed on two existing `react-hooks/set-state-in-effect` errors in untouched `src/components/ui/carousel.tsx:98` and `src/hooks/use-mobile.ts:14`. No rules were disabled and those components were not changed.
- Backend `node --check index.js` and `node --check config.js`: passed. `vercel.json` parses as JSON.
- Backend `npm test`: its existing placeholder exits 1 with `Error: no test specified`; no configured backend unit-test suite is available.
- Eight environment checks passed: production URL validation, missing-variable errors, URL precedence, legacy configuration compatibility, port validation, cookie configuration, Git ignore rules, and unchanged existing environment-file hashes.
- Eleven isolated JWT integration checks passed using the actual Next.js handler and Express code, including ownership, token validation, logout, expired sessions, and public Facility Details.
- Twelve API and desktop/mobile booking regression checks passed. An initial browser rerun was blocked when the local Express service stopped; after restarting the existing API, the complete rerun passed. Tests used disposable accounts/bookings and verified pre-existing bookings were unchanged.

Existing `.env`/`.env.local` files were verified byte-for-byte unchanged. Disposable test accounts/resources were cleaned up. The local Express service is running again on its configured development port. No dependency installation, deployment, Git commit, or push was performed for this change. Actual Vercel domains and complete Google OAuth login remain unverified until the real production environment is configured.
