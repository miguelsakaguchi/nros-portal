import type { QueryClient } from "@tanstack/react-query";

export const UNAUTHORIZED_EVENT = "nros:unauthorized";

export function clearPortalSession(
  queryClient: Pick<QueryClient, "clear">,
  setUser: (user: null) => void,
): void {
  setUser(null);
  queryClient.clear();
}

export function subscribeToUnauthorized(
  target: Pick<Window, "addEventListener" | "removeEventListener">,
  onUnauthorized: () => void,
): () => void {
  target.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  return () => target.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
}