/**
 * Typed endpoint wrappers around the Algonix HTTP client.
 *
 * One function per spec §4.* row. All paths are relative to ALGONIX_BASE_URL
 * which already includes `/api/v2` — so the strings here are `/users`,
 * `/apis`, etc. NEVER double-prefix.
 *
 * Each wrapper parses the response with the matching Zod schema. Parse
 * failures become thrown errors which TanStack Query surfaces as `error` on
 * the hook result.
 */
import algonixClient from "./algonixClient";
import tronClient from "./tronClient";
import {
  userInfoSchema,
  userBalanceSchema,
  validateApiKeyListSchema,
  validateApiResponseSchema,
  settingsPresetListSchema,
  robotsSettingsCreateSchema,
  userRobotEntrySchema,
  userRobotEntryListSchema,
  walletAddressSchema,
  walletAddressListSchema,
} from "./schemas";
import type {
  UserInfoDto,
  ValidateApiKey,
  ValidateApiResponse,
  ValidateApiInput,
  SaveApiInput,
  SettingsPreset,
  RobotsSettingsCreate,
  UserRobotEntry,
  WalletAddressDto,
} from "./types";

/** §4.1 GET /users — current user info. */
export const getUserInfo = async (): Promise<UserInfoDto> => {
  const { data } = await algonixClient.get("/users");
  return userInfoSchema.parse(data);
};

/**
 * GET /users — balance-only view.
 *
 * Same endpoint as `getUserInfo`, but parsed against a permissive schema so
 * the balance widget keeps working even when the backend deviates from
 * `userInfoSchema` on unrelated fields. Returns just `{ balance }`.
 */
export const getUserBalance = async (): Promise<{ balance: number }> => {
  const { data } = await algonixClient.get("/users");
  const parsed = userBalanceSchema.parse(data);
  return { balance: parsed.balance };
};

/** §4.2 GET /apis — saved API keys for the current user. */
export const listApis = async (): Promise<ValidateApiKey[]> => {
  const { data } = await algonixClient.get("/apis");
  return validateApiKeyListSchema.parse(data);
};

/**
 * §4.4 POST /apis/validate — validate creds against the exchange. Returns the
 * live balance. Used both during Phase A (validate-before-save) and Phase B
 * (refresh-balance, called with `{id}`).
 */
export const validateApi = async (
  input: ValidateApiInput
): Promise<ValidateApiResponse> => {
  const { data } = await algonixClient.post("/apis/validate", input);
  return validateApiResponseSchema.parse(data);
};

/** §4.5 POST /apis — persist a validated API key. Returns `apiId`. */
export const saveApi = async (input: SaveApiInput): Promise<string> => {
  const { data } = await algonixClient.post<string>("/apis", input);
  // Backend returns the apiId as a string body. No schema parsing — the
  // shape is too thin for Zod and a runtime cast is sufficient.
  return String(data);
};

/** §4.6 DELETE /apis/{id} — remove a saved API key. */
export const deleteApi = async (apiId: string): Promise<true> => {
  await algonixClient.delete(`/apis/${apiId}`);
  return true;
};

/** §4.7 GET /settings/presets — preset list driving §6 auto-selection. */
export const listPresets = async (): Promise<SettingsPreset[]> => {
  const { data } = await algonixClient.get("/settings/presets");
  return settingsPresetListSchema.parse(data);
};

/** §4.8 POST /robots — terminal call. Returns `robotId`. */
export const createRobot = async (
  input: RobotsSettingsCreate
): Promise<string> => {
  // Validate the body before sending — defaults are filled in here.
  const body = robotsSettingsCreateSchema.parse(input);
  const { data } = await algonixClient.post<string>("/robots", body);
  return String(data);
};

/**
 * GET /statistics/robots/users — robots (with trades) for the current user.
 *
 * Single source of truth for the robots-list view. Invalidated after
 * `createRobot` / `stopRobot`. Each entry is `{ robot, trades }`.
 *
 * Parsing strategy: try the strict array parse first (fast, full type
 * inference). If that fails — typically because one row has an unexpected
 * shape — fall back to per-entry `safeParse` so a single bad row can't sink
 * the entire list. Failures are logged once and dropped; the rest render.
 */
export const listUserRobots = async (): Promise<UserRobotEntry[]> => {
  const { data } = await algonixClient.get("/statistics/robots/users");
  const fast = userRobotEntryListSchema.safeParse(data);
  if (fast.success) return fast.data;

  if (!Array.isArray(data)) {
    throw new Error(
      "GET /statistics/robots/users: expected an array, got " + typeof data
    );
  }

  const out: UserRobotEntry[] = [];
  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const parsed = userRobotEntrySchema.safeParse(entry);
    if (parsed.success) {
      out.push(parsed.data);
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `[TradingBots] /statistics/robots/users: dropping malformed entry #${i}`,
        { issues: parsed.error.issues }
      );
    }
  }
  return out;
};

/** §4.9 DELETE /robots/stop/{id} — fully stop a robot (frees a slot). */
export const stopRobot = async (robotId: string): Promise<true> => {
  await algonixClient.delete(`/robots/stop/${robotId}`);
  return true;
};

/** POST /robots/pause/{id} — pause a running robot (keeps it counted as active). */
export const pauseRobot = async (robotId: string): Promise<true> => {
  await algonixClient.post(`/robots/pause/${robotId}`);
  return true;
};

/** POST /robots/resume/{id} — resume a paused or restart a stopped robot. */
export const resumeRobot = async (robotId: string): Promise<true> => {
  await algonixClient.post(`/robots/resume/${robotId}`);
  return true;
};

/**
 * §4.11 GET /blockchain/addresses/user — list the user's deposit wallets.
 *
 * Routed through the Tron service (`tronClient`) because wallet provisioning
 * lives on that host, not on the main Algonix backend.
 *
 * Returns an empty array when the backend has not yet provisioned a wallet
 * for the user. The deposit modal treats `[]` as a signal to fire
 * `createUserWallet` once.
 */
export const listUserWallets = async (): Promise<WalletAddressDto[]> => {
  const { data } = await tronClient.get("/blockchain/addresses/user");
  return walletAddressListSchema.parse(data);
};

/**
 * §4.10 POST /blockchain/addresses — request a new deposit wallet for the user.
 *
 * Routed through the Tron service (`tronClient`). Body is empty; response
 * shape is permissive — backend may return the new `WalletAddressDto`, an
 * array, or an empty 2xx. We accept all three and rely on the follow-up GET
 * to settle state.
 */
export const createUserWallet = async (): Promise<WalletAddressDto | null> => {
  const { data } = await tronClient.post("/blockchain/addresses", {});
  const single = walletAddressSchema.safeParse(data);
  if (single.success) return single.data;
  const list = walletAddressListSchema.safeParse(data);
  if (list.success) return list.data[0] ?? null;
  return null;
};
