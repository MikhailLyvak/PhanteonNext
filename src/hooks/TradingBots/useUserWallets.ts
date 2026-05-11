"use client";

/**
 * GET /blockchain/addresses/user — deposit wallets for the current user.
 *
 * Returns the TanStack Query result. An empty array (`data === []`) is a
 * legitimate state: the user has no provisioned wallet yet. The deposit
 * modal uses that signal to trigger `useCreateUserWallet`.
 */
import { useQuery } from "@tanstack/react-query";
import { listUserWallets } from "@/api/TradingBots/endpoints";
import { TRADING_BOTS_QUERY_KEYS } from "@/api/TradingBots/constants";
import { useAlgonixSession } from "./useAlgonixSession";

const useUserWallets = (enabled = true) => {
  const { isReady } = useAlgonixSession();
  return useQuery({
    queryKey: TRADING_BOTS_QUERY_KEYS.userWallets,
    queryFn: listUserWallets,
    enabled: isReady && enabled,
  });
};

export default useUserWallets;
