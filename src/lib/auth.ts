import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { readOrigin } from "@/lib/backend";

const isProduction = process.env.NODE_ENV === "production";
const configuredURL = process.env.BETTER_AUTH_URL?.trim() || process.env.NEXT_PUBLIC_AUTH_URL?.trim();
if (isProduction && !configuredURL) throw new Error("Set BETTER_AUTH_URL to your HTTPS frontend origin.");
export const authBaseURL = readOrigin(configuredURL || "http://localhost:3000", "BETTER_AUTH_URL / NEXT_PUBLIC_AUTH_URL");
if (process.env.NEXT_PUBLIC_AUTH_URL?.trim() &&
    readOrigin(process.env.NEXT_PUBLIC_AUTH_URL.trim(), "NEXT_PUBLIC_AUTH_URL") !== authBaseURL) {
  throw new Error("BETTER_AUTH_URL and NEXT_PUBLIC_AUTH_URL must use the same frontend origin.");
}
if (isProduction && !process.env.BETTER_AUTH_SECRET) throw new Error("Set a private BETTER_AUTH_SECRET in the frontend server environment.");

const authMode = process.env.API_AUTH_MODE || "session";
if (!["session", "jwt"].includes(authMode)) throw new Error("API_AUTH_MODE must be session or jwt.");
export const jwtEnabled = authMode === "jwt";
if (isProduction && jwtEnabled && !process.env.JWT_AUDIENCE?.trim()) throw new Error("Set JWT_AUDIENCE to the same value on both servers.");
const configuredAudience = process.env.JWT_AUDIENCE?.trim();
const jwtAudienceValue = configuredAudience || process.env.BACKEND_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
const jwtAudience = jwtEnabled && /^https?:\/\//i.test(jwtAudienceValue)
  ? readOrigin(jwtAudienceValue, "JWT_AUDIENCE")
  : jwtAudienceValue;
const secureCookies = isProduction || authBaseURL.startsWith("https://");

if (!process.env.MONGODB_URI?.trim()) throw new Error("Set MONGODB_URI for the BetterAuth database.");
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db();

export const auth = betterAuth({
  baseURL: authBaseURL,
  trustedOrigins: [authBaseURL],
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: { enabled: true },
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  } : {},
  session: { cookieCache: { enabled: false } },
  advanced: {
    useSecureCookies: secureCookies,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: secureCookies,
      sameSite: "lax",
      path: "/",
    },
  },
  // JWTs are optional API credentials issued from the existing session, never a second login.
  plugins: jwtEnabled ? [jwt({
    disableSettingJwtHeader: true,
    jwt: {
      issuer: authBaseURL,
      audience: jwtAudience,
      expirationTime: "5m",
      definePayload: ({ session }) => ({ sid: session.id }),
    },
  })] : [],
  // Only server-side auth.api.getToken() may issue API JWTs; the browser keeps its session cookie.
  disabledPaths: jwtEnabled ? ["/token"] : [],
});
