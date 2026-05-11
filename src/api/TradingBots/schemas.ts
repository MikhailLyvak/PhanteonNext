/**
 * Zod schemas for the Algonix backend wire contract.
 *
 * Source of truth: api-and-robot-creation-flow.md §4. We validate at the
 * boundary; downstream hooks/components consume `z.infer` types from
 * `./types.ts`.
 *
 * All schemas are deliberately permissive on optional fields — backend may add
 * fields without breaking us.
 */
import { z } from "zod";

/** §4.1 — `UserInfoDto` (the portion the trading-bots flow consumes). */
export const userInfoSchema = z.object({
  id: z.string(),
  paid: z.boolean(),
  email: z.string(),
  balance: z.number(),
  referral_code: z.string(),
  referral_bonus: z.number(),
  role: z.string(),
  subscription_level: z.string(),
  telegram_username: z.string(),
  onboarding: z.boolean(),
  backtests_passed: z.number(),
  backtests_limit: z.number(),
  tunes_passed: z.number(),
  tunes_limit: z.number(),
  tunes_passed0: z.number(),
  tunes_passed1: z.number(),
  tunes_passed2: z.number(),
  tunes_limit0: z.number(),
  tunes_limit1: z.number(),
  tunes_limit2: z.number(),
  robots_active: z.number(),
  robots_limit: z.number(),
});

/**
 * §4.2 — `ValidateApiKey` as returned by GET /apis (saved keys list).
 *
 * The backend strips `secret` from list responses (security), so it is
 * optional here even though spec §4.2 lists it. `status` is an undocumented
 * extra field the backend echoes; passthrough preserves it.
 */
export const validateApiKeySchema = z
  .object({
    id: z.string(),
    title: z.string().optional().default(""),
    balance: z.number(),
    exchange: z.string(),
    key: z.string(),
    secret: z.string().optional().default(""),
    status: z.string().optional(),
    market_type: z.string().optional(),
  })
  .passthrough();

export const validateApiKeyListSchema = z.array(validateApiKeySchema);

/**
 * §4.4 — response of POST /apis/validate.
 *
 * Spec text: "Treat any non-error response (truthy body) as success; the
 * `balance` field carries the live exchange balance." The real backend omits
 * `id`/`secret`/`title` here (it's a validation echo, not a persisted record),
 * and adds a `status` string. Only `balance` is required — everything else is
 * passed through.
 */
export const validateApiResponseSchema = z
  .object({
    balance: z.number(),
    id: z.string().optional(),
    title: z.string().optional(),
    exchange: z.string().optional(),
    key: z.string().optional(),
    secret: z.string().optional(),
    status: z.string().optional(),
    market_type: z.string().optional(),
  })
  .passthrough();

/** §4.4 request body — supports either `{id}` or `{key, secret, exchange}`. */
export const validateApiInputSchema = z.union([
  z.object({ id: z.string() }),
  z.object({
    key: z.string(),
    secret: z.string(),
    exchange: z.string(),
    other: z.string().optional(),
    market_type: z.string().optional(),
  }),
]);

/** §4.5 request body. */
export const saveApiInputSchema = z.object({
  title: z.string().optional(),
  key: z.string(),
  secret: z.string(),
  other: z.string().optional(),
  exchange: z.string(),
  market_type: z.string().optional(),
});

/**
 * GET /statistics/robots/users — robots that belong to the current user.
 *
 * Response is `Array<{ robot, trades }>`. Each `robot` carries its own metrics
 * (pnl, roi, active, paused, drawdown_max, sharp_ratio, days_duration), the
 * nested `api` (always present, exposes exchange/status), and an optional
 * `settings` (some marketplace-imported robots ship without it). All inner
 * objects use `.passthrough()` so the backend can extend without breaking us.
 */
export const userRobotApiSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    key: z.string().optional(),
    exchange: z.string().optional(),
    status: z.string().optional(),
    market_type: z.string().optional(),
    balance: z.number().nullable().optional(),
  })
  .passthrough();

export const userRobotSettingsSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    is_default: z.boolean().optional(),
    leverage: z.number().nullable().optional(),
    max_loss: z.number().nullable().optional(),
    trend: z.string().optional(),
    market_type: z.string().optional(),
    symbol: z.string().optional(),
    deposit_min: z.number().nullable().optional(),
    orders: z.array(z.unknown()).optional(),
  })
  .passthrough();

export const userRobotTradeSchema = z
  .object({
    time: z.number(),
    trend: z.string().optional(),
    condition_type: z.string().optional(),
    quantity: z.number().nullable().optional(),
    price: z.number().nullable().optional(),
    symbol: z.string().optional(),
    pnl: z.number().nullable().optional(),
    roi: z.number().nullable().optional(),
    deposit: z.number().nullable().optional(),
  })
  .passthrough();

/**
 * Robot record. Only `id` is required — every other field is optional so a
 * single odd row (missing title, null deposit, etc.) can't fail the entire
 * list parse. The endpoint additionally `safeParse`s per-entry as a second
 * line of defence.
 */
export const userRobotDataSchema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
    deposit: z.number().nullable().optional(),
    deposit_stop: z.number().nullable().optional(),
    deposit_max: z.number().nullable().optional(),
    drawdown_max: z.number().nullable().optional(),
    sharp_ratio: z.number().nullable().optional(),
    active: z.boolean().optional(),
    paused: z.boolean().optional(),
    days_duration: z.number().nullable().optional(),
    reinvest: z.boolean().optional(),
    notifications_trades: z.boolean().optional(),
    notifications_balance: z.boolean().optional(),
    notifications_api: z.boolean().optional(),
    marketplace: z.boolean().optional(),
    pnl: z.number().nullable().optional(),
    roi: z.number().nullable().optional(),
    api: userRobotApiSchema.optional(),
    settings: userRobotSettingsSchema.optional(),
  })
  .passthrough();

export const userRobotEntrySchema = z
  .object({
    robot: userRobotDataSchema,
    trades: z.array(userRobotTradeSchema).optional().default([]),
  })
  .passthrough();

export const userRobotEntryListSchema = z.array(userRobotEntrySchema);

/**
 * Permissive view of GET /users that ONLY validates the `balance` field.
 *
 * The full `userInfoSchema` is intentionally strict — it backs robot-limit
 * logic and onboarding flags. The balance widget needs none of that; it just
 * needs a number. Coupling the balance display to the strict schema means a
 * single missing field (e.g. backend stops returning `tunes_passed0`) would
 * break the balance UI for every user.
 *
 * `.passthrough()` lets every other field survive untouched, so this schema
 * never rejects on irrelevant changes upstream.
 */
export const userBalanceSchema = z
  .object({
    balance: z.number(),
  })
  .passthrough();

/**
 * §4.11 — `WalletAddressDto` from GET /blockchain/addresses/user.
 *
 * `type` is the chain identifier — currently the UI only consumes "BNB". The
 * schema is `.passthrough()` so any other chains the backend returns survive
 * the parse and are ignored downstream.
 */
export const walletAddressSchema = z
  .object({
    base58: z.string(),
    hex: z.string(),
    type: z.string(),
  })
  .passthrough();

export const walletAddressListSchema = z.array(walletAddressSchema);

/** §4.7 — `SettingsPreset`. */
export const settingsPresetSchema = z.object({
  id: z.string(),
  exchange: z.string(),
  min_deposit: z.number(),
});

export const settingsPresetListSchema = z.array(settingsPresetSchema);

/** §4.8 nested `api` object. */
export const robotsSettingsApiSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  key: z.string().optional(),
  secret: z.string().optional(),
  other: z.string().optional(),
  exchange: z.string().optional(),
  balance: z.number().optional().default(0),
});

/** §4.8 nested `settings` object. */
export const robotsSettingsSettingsSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
  leverage: z.number().int().optional(),
  max_loss: z.number().optional(),
  trend: z.string().optional(),
  symbol: z.string().optional(),
  mock: z.boolean().optional().default(false),
  originalId: z.string().optional(),
  orders: z.array(z.unknown()).optional().default([]),
  market_type: z.enum(["SPOT", "FUTURES"]).optional(),
});

/** §4.8 — `RobotsSettingsCreate`. */
export const robotsSettingsCreateSchema = z.object({
  title: z.string(),
  deposit: z.number().default(0),
  reinvest: z.boolean().default(true),
  depositStop: z.number().optional().default(0),
  notifications_trades: z.boolean().default(false),
  notifications_balance: z.boolean().default(false),
  notifications_api: z.boolean().default(false),
  api: robotsSettingsApiSchema,
  settings: robotsSettingsSettingsSchema,
});
