"use client";

/**
 * Algonix HTTP client.
 *
 * Fresh `axios.create()` — does NOT reuse `src/interceptor/axiosClient.ts`.
 *
 * !!! IMPORTANT — DO NOT ADD A GLOBAL 401 REDIRECT TO THIS CLIENT !!!
 *
 * The platform's `axiosClient.ts` redirects to `/login` on any 401. That
 * behavior is correct for the platform's own backend, but the Algonix backend
 * is a separate trust domain: a 401 from Algonix means "your Algonix session
 * is bad", NOT "you are logged out of Phanteon". Logging the user out of
 * Phanteon because Algonix didn't accept a token would be a regression that's
 * very hard to recover from for the user.
 *
 * The response interceptor below ONLY normalizes the rejected error so hooks
 * can render local error states. It MUST NOT call `router.push('/login')` or
 * `window.location.assign(...)` or anything similar.
 */

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ALGONIX_BASE_URL, composeAuthHeader } from "./config";
import { useAlgonixSessionStore } from "@/store/TradingBots/useAlgonixSessionStore";
import { useUserStore } from "@/store/UserData/useUserStore";

/**
 * Thrown synchronously inside the request interceptor when either the Algonix
 * token or the platform email is missing. Hooks should let this surface so
 * the UI can branch into a "session not ready / connect" state. Do NOT
 * silently fail.
 */
export class AlgonixAuthMissingError extends Error {
  readonly code = "ALGONIX_AUTH_MISSING";
  constructor(missing: "token" | "email" | "both") {
    super(`Algonix auth missing: ${missing}`);
    this.name = "AlgonixAuthMissingError";
    // Restore prototype chain — TS / class-extends-Error gotcha.
    Object.setPrototypeOf(this, AlgonixAuthMissingError.prototype);
  }
}

const algonixClient = axios.create({
  baseURL: ALGONIX_BASE_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

algonixClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read both stores synchronously via .getState() — no React subscription
    // here, the interceptor runs outside the component tree.
    const token = useAlgonixSessionStore.getState().token;
    const userState = useUserStore.getState();
    const email = (userState.user?.email ?? null) as string | null;

    if (!token && !email) {
      throw new AlgonixAuthMissingError("both");
    }
    if (!token) {
      throw new AlgonixAuthMissingError("token");
    }
    if (!email) {
      throw new AlgonixAuthMissingError("email");
    }

    config.headers.set("Authorization", composeAuthHeader(token, email));
    return config;
  }
);

algonixClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  // NOTE: this handler exists ONLY to forward errors. No 401 redirect, no
  // cookie clearing, no localStorage wipes. Algonix 4xx/5xx surface as local
  // errors to the calling hook.
  (error: AxiosError) => Promise.reject(error)
);

export default algonixClient;
