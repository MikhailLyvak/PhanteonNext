/**
 * Trading-bots constants.
 *
 * Hardcoded exchange list — spec §4.3 (`GET /apis/available`) is documented as
 * "contract not verified", so we hardcode for v1. TODO: replace with the live
 * call once backend confirms the response shape.
 */
export const SUPPORTED_EXCHANGES = ["BYBIT", "BINANCE", "BINGX"] as const;

export type SupportedExchange = (typeof SUPPORTED_EXCHANGES)[number];

/**
 * TanStack query keys, centralized so hooks and downstream invalidations stay
 * in sync.
 */
export const TRADING_BOTS_QUERY_KEYS = {
  userInfo: ["tradingBots", "userInfo"] as const,
  userApis: ["tradingBots", "userApis"] as const,
  presets: ["tradingBots", "presets"] as const,
  userRobots: ["tradingBots", "userRobots"] as const,
  userWallets: ["tradingBots", "userWallets"] as const,
};

/**
 * Chain identifier the deposit modal pins to. The backend may return
 * additional chains in the wallet list — only this one is rendered.
 */
export const DEPOSIT_WALLET_TYPE = "BNB" as const;
