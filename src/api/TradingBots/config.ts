/**
 * Algonix backend configuration.
 *
 * Spec reference: api-and-robot-creation-flow.md §2 (auth header) and §4 (endpoints).
 *
 * Hardcoded base URL — public API the browser hits regardless. Adding an env
 * var here only adds deploy-config surface area without security benefit. If
 * staging/prod ever split, swap to `process.env.NEXT_PUBLIC_ALGONIX_API_URL`.
 *
 * IMPORTANT: this URL already includes `/api/v2`. Endpoint paths in
 * `endpoints.ts` are written as `/users`, `/apis`, etc. — never double-prefix.
 */
export const ALGONIX_BASE_URL = "https://api.algonix.org/api/v2";

/**
 * Tron wallet service base URL.
 *
 * Address creation (`POST /wallet/create`) lives on a separate service from
 * the main Algonix backend. The host (`https://tron.algonix.org`) does not
 * serve CORS for browser origins, so the browser can't call it directly —
 * we route through a Next.js rewrite at `/tron-proxy/*` (see
 * `next.config.ts`). Server-to-server inside Next has no CORS; the auth
 * header (`Bearer <token>pantheonX<email>`) is passed through unchanged.
 *
 * The address-listing read (`GET /blockchain/addresses/user`) is served by
 * the main Algonix backend, not the Tron service — see `listUserWallets`
 * in `endpoints.ts`.
 */
export const TRON_BASE_URL = "/tron-proxy";

/**
 * Compose the Algonix Authorization header value.
 *
 * Format: `Authorization: Bearer <token>pantheonX<email>`.
 * - The literal substring `pantheonX` separates token from email.
 * - DO NOT URL-encode, DO NOT quote, DO NOT split into two headers.
 */
export const composeAuthHeader = (token: string, email: string): string =>
  `Bearer ${token}pantheonX${email}`;
