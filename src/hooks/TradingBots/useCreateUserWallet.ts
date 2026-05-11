"use client";

/**
 * POST /blockchain/addresses — request a deposit wallet.
 *
 * Spec §4.10 contract is "not verified". The mutation tolerates any 2xx
 * shape (see `createUserWallet` in endpoints.ts). On success we invalidate
 * `userWallets` so the GET refires and the modal renders the new address.
 *
 * The deposit modal calls this at most once per mount (guarded by a ref).
 * If the call fails the modal renders `WalletPendingState` rather than
 * looping.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserWallet } from "@/api/TradingBots/endpoints";
import { TRADING_BOTS_QUERY_KEYS } from "@/api/TradingBots/constants";
import type { WalletAddressDto } from "@/api/TradingBots/types";

const useCreateUserWallet = () => {
  const qc = useQueryClient();
  return useMutation<WalletAddressDto | null, Error, void>({
    mutationFn: createUserWallet,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRADING_BOTS_QUERY_KEYS.userWallets });
    },
  });
};

export default useCreateUserWallet;
