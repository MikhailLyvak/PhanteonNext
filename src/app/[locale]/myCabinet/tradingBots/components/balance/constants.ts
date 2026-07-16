/**
 * Static metadata for the deposit modal.
 *
 * The chain/asset selectors are intentionally pinned: the production deposit
 * flow only supports BNB Smart Chain + USDT (BEP-20). If we ever expose
 * multi-chain UI, replace these singletons with a list and a real selector
 * — see `balance-system.md` §"Supported Networks & Tokens".
 */
export const NETWORK = {
  type: "BNB" as const,
  name: "BNB Smart Chain",
  subname: "BEP-20",
  badge: "BSC",
};

export const ASSET = {
  symbol: "USDT",
  name: "Tether",
};
