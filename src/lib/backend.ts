import "server-only";

export function getBackendURL() {
  const configuredURL = process.env.BACKEND_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (process.env.NODE_ENV === "production" && !configuredURL) {
    throw new Error("Set BACKEND_URL to your HTTPS Express API origin.");
  }
  const url = new URL(configuredURL || "http://localhost:4000");
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("BACKEND_URL must be an HTTP(S) origin without credentials.");
  }
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("Production API requests require HTTPS.");
  }
  return url.origin;
}
