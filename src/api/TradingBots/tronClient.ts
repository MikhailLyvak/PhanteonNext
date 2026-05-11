"use client";

/**
 * Tron wallet HTTP client.
 *
 * Separate axios instance pointed at `TRON_BASE_URL`. The wallet endpoints
 * (`/blockchain/addresses/...`) live on a different host than the main
 * Algonix backend, but share the same auth header format
 * (`Bearer <token>pantheonX<email>`). See balance-system.md.
 *
 * The same 401-no-redirect rule that applies to `algonixClient` applies here:
 * a 401 from the Tron service must NOT log the user out of Phanteon.
 */
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { TRON_BASE_URL, composeAuthHeader } from "./config";
import { useAlgonixSessionStore } from "@/store/TradingBots/useAlgonixSessionStore";
import { useUserStore } from "@/store/UserData/useUserStore";
import { AlgonixAuthMissingError } from "./algonixClient";

const tronClient = axios.create({
  baseURL: TRON_BASE_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

tronClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

tronClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(error)
);

export default tronClient;
