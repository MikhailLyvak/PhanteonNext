"use client";

/**
 * Single source of truth for the Algonix session pair `(token, email)`.
 *
 * "Login" against Algonix is implicit — there is no separate login endpoint.
 * The platform JWT stored in the `local_access_token` cookie IS the Algonix
 * token. We verify it by calling GET /users with the composed auth header
 * `<token>pantheonX<email>`. A 200 means the session is "ready"; any other
 * outcome surfaces an error so the UI can prompt the user to re-login or
 * retry.
 *
 * `email` comes from the existing platform auth (`useUserStore`).
 *
 * This hook bypasses `algonixClient` for its verification call to avoid a
 * chicken-and-egg: that client reads the token from this session store,
 * which is empty at the moment of verification.
 *
 * Dev unblock: in `NODE_ENV === 'development'`, this hook installs a
 * `window.__algonix.setToken(t)` helper so engineers can paste a token from
 * the devtools console (useful when the platform cookie isn't usable in the
 * current local setup). Nothing renders to the DOM, so there's no
 * production-leak risk if a build flag misfires.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Cookies } from "react-cookie";
import { useUserStore } from "@/store/UserData/useUserStore";
import { useAlgonixSessionStore } from "@/store/TradingBots/useAlgonixSessionStore";
import { ALGONIX_BASE_URL, composeAuthHeader } from "@/api/TradingBots/config";

const PLATFORM_TOKEN_COOKIE = "local_access_token";

async function verifyAlgonixToken(token: string, email: string): Promise<void> {
  await axios.get(`${ALGONIX_BASE_URL}/users`, {
    headers: { Authorization: composeAuthHeader(token, email) },
  });
}

export interface UseAlgonixSessionResult {
  token: string | null;
  email: string | null;
  isReady: boolean;
  error: Error | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
}

export const useAlgonixSession = (): UseAlgonixSessionResult => {
  const token = useAlgonixSessionStore((s) => s.token);
  const setToken = useAlgonixSessionStore((s) => s.setToken);
  const user = useUserStore((s) => s.user);
  const email = (user?.email ?? null) as string | null;
  const [error, setError] = useState<Error | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const autoConnectFiredRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof window === "undefined") return;
    window.__algonix = {
      setToken: (t: string) =>
        useAlgonixSessionStore.setState({ token: t }),
    };
    return () => {
      if (typeof window !== "undefined") {
        delete window.__algonix;
      }
    };
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined") return;
    setError(null);
    if (!email) {
      setError(new Error("Email користувача не знайдено"));
      return;
    }
    const cookies = new Cookies();
    const raw = cookies.get(PLATFORM_TOKEN_COOKIE) as unknown;
    if (typeof raw !== "string" || raw.length === 0) {
      setError(new Error("Сесія платформи не знайдена. Будь ласка, увійдіть знову."));
      setToken(null);
      return;
    }
    // PostAuth stores the cookie as `Token <jwt>`. Algonix expects the bare
    // token in `<token>pantheonX<email>`, so strip the prefix here.
    const candidate = raw.startsWith("Token ") ? raw.slice("Token ".length) : raw;
    setIsConnecting(true);
    try {
      await verifyAlgonixToken(candidate, email);
      setToken(candidate);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setToken(null);
    } finally {
      setIsConnecting(false);
    }
  }, [email, setToken]);

  useEffect(() => {
    if (token) return;
    if (!email) return;
    if (autoConnectFiredRef.current) return;
    autoConnectFiredRef.current = true;
    void connect();
  }, [email, token, connect]);

  return {
    token,
    email,
    isReady: Boolean(token && email),
    error,
    isConnecting,
    connect,
  };
};
