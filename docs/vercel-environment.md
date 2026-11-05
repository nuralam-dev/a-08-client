# StudioSpace production environment

Verified November 5, 2026. These settings belong to the existing projects. No project creation, secret changes, or deployment is required from an agent.

## Frontend: studiospace-client

Set in Vercel Production (configure Preview separately):

```dotenv
BETTER_AUTH_URL=https://studiospace-client-ruby.vercel.app
AUTH_TRUSTED_ORIGINS=https://studiospace-client-ruby.vercel.app
BACKEND_URL=https://studiospace-server-five-nu.vercel.app
API_AUTH_MODE=jwt
JWT_AUDIENCE=studiospace-api
BETTER_AUTH_SECRET=<keep existing private secret, at least 32 characters>
MONGODB_URI=<keep existing private auth database URI>
```

Only the supplied frontend is approved. Do not add historical deployment aliases or wildcard origins. Keep `NEXT_PUBLIC_AUTH_URL` unset; if retained it must equal `BETTER_AUTH_URL`. The browser explicitly calls its own origin at `/api/auth` and `/api/backend`. No shared cookie domain is needed.

`NEXT_PUBLIC_API_URL` is an optional legacy fallback. Production currently has `studiospace-server-five-nu.vercel.app` without a scheme. Correct it to `https://studiospace-server-five-nu.vercel.app` or remove it. The currently correct `BACKEND_URL` takes precedence, so this malformed fallback is not the observed login cause.

Production variable names and non-secret values were read from the existing project. The auth secret is present and at least 32 characters; the MongoDB URI is present and its database passed a read-only ping. Values were not overwritten. Neither secret belongs in a `NEXT_PUBLIC_` variable.

Optional Google sign-in requires both `GOOGLE_CLIENT_ID` and private `GOOGLE_CLIENT_SECRET`, and this Google authorized callback:
`https://studiospace-client-ruby.vercel.app/api/auth/callback/google`.
Neither provider variable is currently listed in Production; email/password does not require them.

## Backend: studiospace-server

Use the existing backend project, preserving its database and credentials:

```dotenv
CLIENT_URL=https://studiospace-client-ruby.vercel.app
AUTH_BASE_URL=https://studiospace-client-ruby.vercel.app
API_AUTH_MODE=jwt
JWT_AUDIENCE=studiospace-api
MONGODB_URI=<keep existing private studio database URI>
```

The existing backend source uses `MONGODB_DB_NAME=A08` by default. Preserve the existing database. Remove obsolete `CLIENT_ORIGIN` if it conflicts with `CLIENT_URL`. If legacy `JWT_ISSUER` or `JWT_JWKS_URL` overrides exist, align them with the frontend origin and `https://studiospace-client-ruby.vercel.app/api/auth/jwks`, or remove them to use the derived defaults. Backend environment values were not independently downloaded. The backend does not need `BETTER_AUTH_SECRET` or Google secrets.

## Manual completion

Review the local changes and manually deploy to the existing frontend project when ready. Correct/remove the malformed optional fallback. Verify the backend variables above and redeploy that existing project only if settings change. Keep secrets stable. Do not copy local localhost settings into Production.

Then use your own test account on the canonical frontend to complete valid registration, signin, session refresh, a protected dashboard API call, and logout. Inspect the session cookie for Secure, HttpOnly, SameSite=Lax, Path=/, and no Domain attribute. Successful production account creation and authenticated API forwarding were not attempted because no test credentials were supplied and this audit avoided production database writes.
