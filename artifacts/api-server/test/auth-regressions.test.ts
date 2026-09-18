import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app";
import { customFetch } from "../../../lib/api-client-react/src/custom-fetch";
import {
  clearPortalSession,
  subscribeToUnauthorized,
  UNAUTHORIZED_EVENT,
} from "../../nros-portal/src/auth/session-state";

const nativeFetch = globalThis.fetch;
let server: http.Server;
let baseUrl: string;

before(async () => {
  process.env.NODE_ENV = "test";
  process.env.LOG_LEVEL = "silent";
  process.env.GOOGLE_CLIENT_ID = "test-client-id.apps.googleusercontent.com";
  process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  globalThis.fetch = nativeFetch;
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function request(path: string, init?: RequestInit): Promise<Response> {
  return nativeFetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...init,
  });
}

function sessionCookie(response: Response): string {
  const value = response.headers.get("set-cookie");
  assert.ok(value, "expected a session cookie");
  return value.split(";", 1)[0];
}

function redirectLocation(response: Response): URL {
  const location = response.headers.get("location");
  assert.ok(location, "expected a redirect location");
  return new URL(location, baseUrl);
}

describe("public and protected API contracts", () => {
  test("keeps health and anonymous assessment public", async () => {
    const [health, assessment] = await Promise.all([
      request("/api/healthz"),
      request("/api/assessment"),
    ]);

    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "ok" });
    assert.equal(assessment.status, 200);
    assert.equal((await assessment.json()).id, 1);
  });

  test("rejects every management endpoint without a session", async () => {
    const responses = await Promise.all(
      ["/api/dashboard", "/api/risks", "/api/action-plans"].map(request),
    );

    for (const response of responses) {
      assert.equal(response.status, 401);
      assert.equal((await response.json()).error, "UNAUTHORIZED");
    }
  });
});

describe("Google OAuth and session lifecycle", () => {
  test("uses state once, handles provider errors, and only redirects locally", async () => {
    const start = await request(
      "/api/auth/google?returnTo=%2Fdashboard%3Ftab%3Dsecurity",
    );
    assert.equal(start.status, 302);
    const authorizationUrl = redirectLocation(start);
    const state = authorizationUrl.searchParams.get("state");
    assert.ok(state);

    const denied = await request(
      `/api/auth/google/callback?state=${encodeURIComponent(state)}&error=access_denied`,
    );
    const deniedLocation = redirectLocation(denied);
    assert.equal(deniedLocation.pathname, "/dashboard");
    assert.equal(deniedLocation.searchParams.get("tab"), "security");
    assert.equal(deniedLocation.searchParams.get("authError"), "access_denied");

    const replay = await request(
      `/api/auth/google/callback?state=${encodeURIComponent(state)}&error=access_denied`,
    );
    const replayLocation = redirectLocation(replay);
    assert.equal(replayLocation.origin, baseUrl);
    assert.equal(replayLocation.pathname, "/");
    assert.equal(replayLocation.searchParams.get("authError"), "invalid_state");

    const unsafeStart = await request(
      "/api/auth/google?returnTo=%2F%2Fevil.example%2Fsteal",
    );
    const unsafeState = redirectLocation(unsafeStart).searchParams.get("state");
    assert.ok(unsafeState);
    const unsafeDenied = await request(
      `/api/auth/google/callback?state=${encodeURIComponent(unsafeState)}&error=access_denied`,
    );
    const unsafeLocation = redirectLocation(unsafeDenied);
    assert.equal(unsafeLocation.origin, baseUrl);
    assert.equal(unsafeLocation.pathname, "/");
  });

  test("creates, expires, and logs out a mocked Google session", async () => {
    const originalNow = Date.now;
    const fixedNow = originalNow();
    Date.now = () => fixedNow;

    const externalFetch = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      if (url === "https://oauth2.googleapis.com/token") {
        assert.equal(init?.method, "POST");
        return new Response(JSON.stringify({ access_token: "mock-access-token" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (url === "https://openidconnect.googleapis.com/v1/userinfo") {
        assert.equal(new Headers(init?.headers).get("authorization"), "Bearer mock-access-token");
        return new Response(
          JSON.stringify({
            sub: "google-user-1",
            name: "Pessoa Teste",
            email: "pessoa@example.com",
            email_verified: true,
            picture: "https://example.com/picture.png",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return externalFetch(input, init);
    };

    try {
      const start = await request("/api/auth/google?returnTo=%2Friscos");
      const state = redirectLocation(start).searchParams.get("state");
      assert.ok(state);

      const callback = await request(
        `/api/auth/google/callback?state=${encodeURIComponent(state)}&code=mock-code`,
      );
      assert.equal(callback.status, 302);
      assert.equal(redirectLocation(callback).pathname, "/riscos");
      const cookie = sessionCookie(callback);

      const me = await request("/api/auth/me", {
        headers: { cookie },
      });
      assert.equal(me.status, 200);
      assert.deepEqual((await me.json()).user, {
        id: "google-user-1",
        name: "Pessoa Teste",
        email: "pessoa@example.com",
        picture: "https://example.com/picture.png",
      });

      Date.now = () => fixedNow + 7 * 24 * 60 * 60 * 1000 + 1;
      const expired = await request("/api/auth/me", { headers: { cookie } });
      assert.equal(expired.status, 401);

      Date.now = originalNow;
      const freshStart = await request("/api/auth/google?returnTo=%2F");
      const freshState = redirectLocation(freshStart).searchParams.get("state");
      assert.ok(freshState);
      const freshCallback = await request(
        `/api/auth/google/callback?state=${encodeURIComponent(freshState)}&code=mock-code`,
      );
      const freshCookie = sessionCookie(freshCallback);

      const logout = await request("/api/auth/logout", {
        method: "POST",
        headers: { cookie: freshCookie },
      });
      assert.equal(logout.status, 204);
      assert.match(logout.headers.get("set-cookie") ?? "", /Max-Age=0/);

      const afterLogout = await request("/api/auth/me", {
        headers: { cookie: freshCookie },
      });
      assert.equal(afterLogout.status, 401);
    } finally {
      Date.now = originalNow;
      globalThis.fetch = externalFetch;
    }
  });

  test("returns a local error when the provider exchange fails", async () => {
    const start = await request("/api/auth/google?returnTo=%2Frelatorios");
    const state = redirectLocation(start).searchParams.get("state");
    assert.ok(state);

    const externalFetch = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (String(input) === "https://oauth2.googleapis.com/token") {
        return new Response("provider unavailable", { status: 503 });
      }
      return externalFetch(input, init);
    };

    try {
      const callback = await request(
        `/api/auth/google/callback?state=${encodeURIComponent(state)}&code=mock-code`,
      );
      const location = redirectLocation(callback);
      assert.equal(location.origin, baseUrl);
      assert.equal(location.pathname, "/relatorios");
      assert.equal(location.searchParams.get("authError"), "login_failed");
    } finally {
      globalThis.fetch = externalFetch;
    }
  });

  test("does not create a session for an incomplete Google profile", async () => {
    const start = await request("/api/auth/google?returnTo=%2F");
    const state = redirectLocation(start).searchParams.get("state");
    assert.ok(state);

    const externalFetch = globalThis.fetch;
    globalThis.fetch = async (input) => {
      const url = String(input);
      if (url === "https://oauth2.googleapis.com/token") {
        return new Response(JSON.stringify({ access_token: "mock-access-token" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (url === "https://openidconnect.googleapis.com/v1/userinfo") {
        return new Response(
          JSON.stringify({
            sub: "google-user-incomplete",
            name: "",
            email: "unverified@example.com",
            email_verified: false,
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return externalFetch(input);
    };

    try {
      const callback = await request(
        `/api/auth/google/callback?state=${encodeURIComponent(state)}&code=mock-code`,
      );
      const location = redirectLocation(callback);
      assert.equal(location.pathname, "/");
      assert.equal(location.searchParams.get("authError"), "invalid_profile");
      assert.equal(callback.headers.get("set-cookie"), null);
    } finally {
      globalThis.fetch = externalFetch;
    }
  });
});

describe("portal cache invalidation after unauthorized responses", () => {
  test("dispatches the unauthorized event and clears the session cache", async () => {
    const target = new EventTarget();
    const fakeWindow = target as unknown as Window;
    const cache = {
      clearCalls: 0,
      clear() {
        this.clearCalls += 1;
      },
    };
    let user: { id: string } | null = { id: "user-1" };
    const unsubscribe = subscribeToUnauthorized(fakeWindow, () =>
      clearPortalSession(cache, (nextUser) => {
        user = nextUser;
      }),
    );

    const previousWindow = (globalThis as { window?: Window }).window;
    const previousFetch = globalThis.fetch;
    (globalThis as { window?: Window }).window = fakeWindow;
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });

    try {
      await assert.rejects(
        customFetch("/api/dashboard", { responseType: "json" }),
        (error: { status?: number }) => error.status === 401,
      );
      assert.equal(user, null);
      assert.equal(cache.clearCalls, 1);
      assert.equal(UNAUTHORIZED_EVENT, "nros:unauthorized");
    } finally {
      unsubscribe();
      globalThis.fetch = previousFetch;
      if (previousWindow) {
        (globalThis as { window?: Window }).window = previousWindow;
      } else {
        delete (globalThis as { window?: Window }).window;
      }
    }
  });
});