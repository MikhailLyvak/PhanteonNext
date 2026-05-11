"use client";

/**
 * Balance-only fetch from GET /users.
 *
 * We deliberately do NOT reuse `useUserInfo` here. Its `userInfoSchema` is
 * strict — every field required — and the backend may legitimately omit
 * fields that have nothing to do with the platform balance (the
 * `tunes_passed0/1/2`, `tunes_limit0/1/2` fields are hard-coded into that
 * schema and bracket the rest of the parse). When the strict parse fails,
 * `query.data` becomes undefined and the balance widget would render `$—`
 * even though `balance` was clearly present in the response.
 *
 * This hook uses its own permissive schema (`userBalanceSchema`) that only
 * validates `balance` and passes everything else through. Different query
 * key so it stays cached independently.
 */
import { useQuery } from "@tanstack/react-query";
import { getUserBalance } from "@/api/TradingBots/endpoints";
import { useAlgonixSession } from "./useAlgonixSession";

const USER_BALANCE_QUERY_KEY = ["tradingBots", "userBalance"] as const;

const useUserBalance = () => {
  const { isReady } = useAlgonixSession();
  const query = useQuery({
    queryKey: USER_BALANCE_QUERY_KEY,
    queryFn: getUserBalance,
    enabled: isReady,
  });
  return {
    balance: query.data?.balance ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useUserBalance;
