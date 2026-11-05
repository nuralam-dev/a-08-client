import { NextRequest } from "next/server";
import { auth, authBaseURL, jwtEnabled } from "@/lib/auth";
import { getBackendURL } from "@/lib/backend";

async function handleRequest(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const method = request.method;
  const isRead = method === "GET" || method === "HEAD";
  const facilityRoot = path.length === 1 && path[0] === "facilities";
  const facilityId = path.length === 2 && path[0] === "facilities" && /^[a-f0-9]{24}$/i.test(path[1]);
  const mine = path.length === 2 && path[0] === "facilities" && ["mine", "my"].includes(path[1]);
  const bookings = path.length === 2 && path[0] === "facilities" && path[1] === "booking";
  const bookingId = path.length === 3 && path[0] === "facilities" && path[1] === "booking" && /^[a-f0-9]{24}$/i.test(path[2]);
  const publicRead = isRead && (facilityRoot || facilityId);
  const allowed = publicRead || (facilityRoot && method === "POST") || (mine && isRead) ||
    (bookings && (isRead || method === "POST")) || (facilityId && ["PATCH", "DELETE"].includes(method)) ||
    (bookingId && method === "DELETE");
  if (!allowed) return Response.json({ message: "Route not found." }, { status: 404 });

  const privateHeaders = { "Cache-Control": "private, no-store" };
  // Same-origin cookies authenticate browser requests. Reject cross-site writes before forwarding.
  if (!isRead && request.headers.get("origin") !== authBaseURL) {
    return Response.json({ message: "This request origin is not allowed." }, { status: 403, headers: privateHeaders });
  }

  try {
    const upstreamHeaders = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) upstreamHeaders.set("content-type", contentType);

    if (!publicRead) {
      const session = await auth.api.getSession({ headers: request.headers, query: { disableCookieCache: true } });
      if (!session) return Response.json({ message: "Please log in to continue." }, { status: 401, headers: privateHeaders });
      upstreamHeaders.set("cookie", request.headers.get("cookie") || "");
      if (jwtEnabled) {
        const { token } = await auth.api.getToken({ headers: request.headers });
        upstreamHeaders.set("authorization", `Bearer ${token}`);
      }
    }

    const url = new URL(`/${path.map(encodeURIComponent).join("/")}`, getBackendURL());
    url.search = request.nextUrl.search;
    const response = await fetch(url, {
      method,
      headers: upstreamHeaders,
      ...(!isRead ? { body: await request.text() } : {}),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    return new Response(method === "HEAD" || response.status === 204 ? null : await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        ...privateHeaders,
      },
    });
  } catch {
    return Response.json({ message: "Unable to contact the API or verify your session. Please try again." }, { status: 503, headers: privateHeaders });
  }
}

export { handleRequest as GET, handleRequest as POST, handleRequest as PATCH, handleRequest as DELETE };
