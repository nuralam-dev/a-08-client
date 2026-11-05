import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

async function handle(request: Request) {
  try {
    const handlers = toNextJsHandler(getAuth().auth);
    return await (request.method === "GET" ? handlers.GET(request) : handlers.POST(request));
  } catch {
    // Do not expose environment values, database errors, credentials, or cookies.
    console.error("Authentication request failed: check server configuration and database availability.");
    return Response.json(
      { code: "AUTH_UNAVAILABLE", message: "Authentication is temporarily unavailable. Please try again later." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export { handle as GET, handle as POST };
