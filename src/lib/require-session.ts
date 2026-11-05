import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireSession(returnTo: string) {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return session;
}
