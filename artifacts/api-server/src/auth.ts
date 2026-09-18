import { createHash, randomBytes } from "node:crypto";
import type { Request, Response, RequestHandler } from "express";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  picture: string | null;
};

type OAuthState = {
  returnTo: string;
  expiresAt: number;
};

type Session = {
  user: AuthUser;
  expiresAt: number;
};

class GoogleProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleProfileError";
  }
}

const SESSION_COOKIE = "nros_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const sessions = new Map<string, Session>();
const oauthStates = new Map<string, OAuthState>();

function requiredEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value || null;
}

function sessionSecret(): string {
  const configured = requiredEnv("SESSION_SECRET");
  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production");
  }
  return configured ?? "nros-development-session-secret";
}

function cookieOptions() {
  return [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ].join("; ");
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.cookie;
  if (!header) return null;

  const pair = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!pair) return null;
  return decodeURIComponent(pair.slice(name.length + 1));
}

function hashSessionToken(token: string): string {
  return createHash("sha256")
    .update(`${sessionSecret()}:${token}`)
    .digest("hex");
}

function createSession(user: AuthUser): string {
  const token = randomBytes(32).toString("base64url");
  sessions.set(hashSessionToken(token), {
    user,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

function getSession(request: Request): { key: string; session: Session } | null {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;

  const key = hashSessionToken(token);
  const session = sessions.get(key);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(key);
    return null;
  }

  return { key, session };
}

function clearSession(request: Request, response: Response): void {
  const current = getSession(request);
  if (current) sessions.delete(current.key);
  response.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; ${cookieOptions()}; Max-Age=0`,
  );
}

function isSafeReturnTo(value: string | null): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

function defaultReturnTo(): string {
  return "/";
}

function getRedirectUri(request: Request): string {
  const configured = requiredEnv("GOOGLE_REDIRECT_URI");
  if (configured) return configured;

  const forwardedProto = request.headers["x-forwarded-proto"];
  const protocol =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0].trim()
      : request.protocol;
  const forwardedHost = request.headers["x-forwarded-host"];
  const host =
    typeof forwardedHost === "string"
      ? forwardedHost.split(",")[0].trim()
      : request.get("host");

  if (!host) {
    throw new Error("Unable to determine OAuth redirect host");
  }

  return `${protocol}://${host}/api/auth/google/callback`;
}

function oauthIsConfigured(): boolean {
  const clientId = requiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requiredEnv("GOOGLE_CLIENT_SECRET");
  return Boolean(
    clientId?.endsWith(".apps.googleusercontent.com") && clientSecret,
  );
}

function pruneExpiredOAuthState(): void {
  const now = Date.now();
  for (const [state, value] of oauthStates) {
    if (value.expiresAt <= now) oauthStates.delete(state);
  }
}

function oauthErrorRedirect(returnTo: string, code: string): string {
  const separator = returnTo.includes("?") ? "&" : "?";
  return `${returnTo}${separator}authError=${encodeURIComponent(code)}`;
}

export function currentUser(request: Request): AuthUser | null {
  return getSession(request)?.session.user ?? null;
}

export const requireAuth: RequestHandler = (request, response, next) => {
  const current = getSession(request);
  if (!current) {
    response.status(401).json({
      error: "UNAUTHORIZED",
      message: "É necessário entrar com uma conta Google para acessar este conteúdo.",
    });
    return;
  }

  (request as Request & { user?: AuthUser }).user = current.session.user;
  next();
};

export function authHandlers() {
  const startGoogleAuth: RequestHandler = (request, response) => {
    const requestedReturnTo = request.query.returnTo;
    const returnTo =
      typeof requestedReturnTo === "string" && isSafeReturnTo(requestedReturnTo)
        ? requestedReturnTo
        : defaultReturnTo();

    if (!oauthIsConfigured()) {
      if (request.accepts("html")) {
        response.redirect(oauthErrorRedirect(returnTo, "auth_not_configured"));
        return;
      }
      response.status(503).json({
        error: "AUTH_NOT_CONFIGURED",
        message: "O login com Google ainda não foi configurado neste ambiente.",
      });
      return;
    }

    pruneExpiredOAuthState();
    const state = randomBytes(24).toString("base64url");
    oauthStates.set(state, {
      returnTo,
      expiresAt: Date.now() + OAUTH_STATE_TTL_MS,
    });

    const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authorizationUrl.search = new URLSearchParams({
      client_id: requiredEnv("GOOGLE_CLIENT_ID")!,
      redirect_uri: getRedirectUri(request),
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
      prompt: "select_account",
    }).toString();

    response.redirect(authorizationUrl.toString());
  };

  const googleCallback: RequestHandler = async (request, response) => {
    const state = typeof request.query.state === "string" ? request.query.state : null;
    const storedState = state ? oauthStates.get(state) : undefined;
    if (state) oauthStates.delete(state);

    const returnTo = storedState?.returnTo ?? defaultReturnTo();
    if (!storedState || storedState.expiresAt <= Date.now()) {
      response.redirect(oauthErrorRedirect(returnTo, "invalid_state"));
      return;
    }

    if (typeof request.query.error === "string") {
      response.redirect(oauthErrorRedirect(returnTo, "access_denied"));
      return;
    }

    const code = typeof request.query.code === "string" ? request.query.code : null;
    if (!code || !oauthIsConfigured()) {
      response.redirect(oauthErrorRedirect(returnTo, "login_failed"));
      return;
    }

    try {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: requiredEnv("GOOGLE_CLIENT_ID")!,
          client_secret: requiredEnv("GOOGLE_CLIENT_SECRET")!,
          redirect_uri: getRedirectUri(request),
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) throw new Error("Google token exchange failed");
      const tokenData = (await tokenResponse.json()) as { access_token?: string };
      if (!tokenData.access_token) throw new Error("Google token response was incomplete");

      const profileResponse = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        {
          headers: { authorization: `Bearer ${tokenData.access_token}` },
        },
      );
      if (!profileResponse.ok) throw new Error("Google profile lookup failed");

      const profile = (await profileResponse.json()) as {
        sub?: string;
        name?: string;
        email?: string;
        email_verified?: boolean;
        picture?: string;
      };
      const name = profile.name?.trim();
      const email = profile.email?.trim().toLocaleLowerCase();
      if (!profile.sub || !name || !email || profile.email_verified !== true) {
        throw new GoogleProfileError(
          "Google profile response was incomplete or unverified",
        );
      }

      const user: AuthUser = {
        id: profile.sub,
        name,
        email,
        picture: profile.picture ?? null,
      };
      const sessionToken = createSession(user);
      response.setHeader(
        "Set-Cookie",
        `${SESSION_COOKIE}=${encodeURIComponent(sessionToken)}; ${cookieOptions()}; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
      );
      response.redirect(returnTo);
    } catch (error) {
      request.log.error({ err: error }, "Google authentication failed");
      response.redirect(
        oauthErrorRedirect(
          returnTo,
          error instanceof GoogleProfileError
            ? "invalid_profile"
            : "login_failed",
        ),
      );
    }
  };

  const getCurrentUser: RequestHandler = (request, response) => {
    const user = currentUser(request);
    if (!user) {
      response.status(401).json({
        error: "UNAUTHORIZED",
        message: "Nenhuma sessão ativa.",
      });
      return;
    }
    response.json({ user });
  };

  const logout: RequestHandler = (request, response) => {
    clearSession(request, response);
    response.status(204).end();
  };

  return { startGoogleAuth, googleCallback, getCurrentUser, logout };
}
