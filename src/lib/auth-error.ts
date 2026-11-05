/** Distinguish service failures from rejected credentials without exposing server details. */
export function authErrorMessage(error: { status?: number; message?: string }, fallback: string) {
  if (error.status && error.status >= 500) {
    return "Authentication is temporarily unavailable. Please try again later.";
  }
  if (error.status === 429) return "Too many attempts. Please wait and try again.";
  return error.message || (error.status ? `${fallback} (HTTP ${error.status}).` : fallback);
}
