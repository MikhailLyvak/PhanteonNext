/**
 * Inferred types re-exported from `./schemas.ts`. Hooks and downstream agents
 * (Agents 2/3/4) import these — DO NOT re-derive types elsewhere.
 *
 * Also augments the `Window` interface with the dev-only `__algonix` helper
 * defined in `useAlgonixSession.ts`. Living here keeps the global declaration
 * accessible across the trading-bots module without polluting other surfaces.
 */
import type { z } from "zod";
import type {
  userInfoSchema,
  validateApiKeySchema,
  validateApiResponseSchema,
  validateApiInputSchema,
  saveApiInputSchema,
  settingsPresetSchema,
  robotsSettingsCreateSchema,
  userRobotEntrySchema,
  userRobotDataSchema,
  userRobotApiSchema,
  userRobotSettingsSchema,
  userRobotTradeSchema,
  walletAddressSchema,
} from "./schemas";

export type UserInfoDto = z.infer<typeof userInfoSchema>;
export type ValidateApiKey = z.infer<typeof validateApiKeySchema>;
export type ValidateApiResponse = z.infer<typeof validateApiResponseSchema>;
export type ValidateApiInput = z.infer<typeof validateApiInputSchema>;
export type SaveApiInput = z.infer<typeof saveApiInputSchema>;
export type SettingsPreset = z.infer<typeof settingsPresetSchema>;
export type RobotsSettingsCreate = z.infer<typeof robotsSettingsCreateSchema>;

/** Single entry from GET /statistics/robots/users. */
export type UserRobotEntry = z.infer<typeof userRobotEntrySchema>;
export type UserRobotData = z.infer<typeof userRobotDataSchema>;
export type UserRobotApi = z.infer<typeof userRobotApiSchema>;
export type UserRobotSettings = z.infer<typeof userRobotSettingsSchema>;
export type UserRobotTrade = z.infer<typeof userRobotTradeSchema>;

/** §4.11 wallet entry returned by GET /blockchain/addresses/user. */
export type WalletAddressDto = z.infer<typeof walletAddressSchema>;

/**
 * Dev-only escape hatch declared on `window` by `useAlgonixSession`. See that
 * file's comment block for usage. Type-augment in this central file so the
 * global is consistently typed wherever it might be touched.
 */
declare global {
  interface Window {
    __algonix?: {
      setToken: (t: string) => void;
    };
  }
}
