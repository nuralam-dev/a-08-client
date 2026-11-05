import { createAuthClient } from "better-auth/react"
// BetterAuth lives at /api/auth on the current frontend domain, locally and on Vercel.
export const authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_AUTH_URL?.trim() || undefined })
export const { signIn, signUp, useSession } = authClient
