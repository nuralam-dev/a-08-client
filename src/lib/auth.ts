import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const isProduction = process.env.NODE_ENV === "production";
const configuredURL = process.env.BETTER_AUTH_URL?.trim();
if (isProduction && !configuredURL) throw new Error("Set BETTER_AUTH_URL to your HTTPS frontend origin.");
export const authBaseURL = new URL(configuredURL || "http://localhost:3000").origin;
if (isProduction && !authBaseURL.startsWith("https://")) throw new Error("Production authentication requires HTTPS.");
if (isProduction && !process.env.BETTER_AUTH_SECRET) throw new Error("Set a private BETTER_AUTH_SECRET in the frontend server environment.");

const authMode = process.env.API_AUTH_MODE || "session";
if (!["session", "jwt"].includes(authMode)) throw new Error("API_AUTH_MODE must be session or jwt.");
export const jwtEnabled = authMode === "jwt";
if (isProduction && jwtEnabled && !process.env.JWT_AUDIENCE?.trim()) throw new Error("Set JWT_AUDIENCE to the same value on both servers.");
const jwtAudience = process.env.JWT_AUDIENCE?.trim() || process.env.BACKEND_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
const secureCookies = isProduction || authBaseURL.startsWith("https://");

const client = new MongoClient(process.env.MONGODB_URI as string);
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
