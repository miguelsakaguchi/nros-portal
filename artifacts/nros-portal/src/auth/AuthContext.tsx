import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  clearPortalSession,
  subscribeToUnauthorized,
} from "./session-state";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  picture: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (returnTo?: string) => void;
  signOut: () => Promise<void>;
  retry: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
    headers: { accept: "application/json" },
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Não foi possível verificar a sessão.");

  const body = (await response.json()) as { user?: AuthUser };
  return body.user ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    loadCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setUser(null);
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível verificar a sessão.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  useEffect(() => {
    return subscribeToUnauthorized(window, () =>
      clearPortalSession(queryClient, () => setUser(null)),
    );
  }, [queryClient]);

  const signIn = useCallback((returnTo = window.location.pathname) => {
    const safeReturnTo =
      returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
    window.location.assign(
      `/api/auth/google?returnTo=${encodeURIComponent(safeReturnTo)}`,
    );
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Clear the local state even if the network is unavailable. The next
      // session check will still reject the old cookie if the server kept it.
    } finally {
      clearPortalSession(queryClient, () => setUser(null));
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      signIn,
      signOut,
      retry: () => setAttempt((current) => current + 1),
    }),
    [user, isLoading, error, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}