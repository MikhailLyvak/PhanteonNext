"use client";

/**
 * GET /users — drives onboarding semantics and surfaces user limits.
 *
 * Spec §4.1. Note the deliberate divergence from §7: this app's "Торгові
 * боти" cabinet tab does NOT skip the entire flow when `onboarding === true`
 * — see plan, "Onboarding semantics" — but the flag is still consumed by
 * downstream UI to choose default landing.
 *
 * Returns the TanStack Query result object directly. Stable shape — Agents
 * 2/3/4 import without further wrapping.
 */
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "@/api/TradingBots/endpoints";
import { TRADING_BOTS_QUERY_KEYS } from "@/api/TradingBots/constants";
import { useAlgonixSession } from "./useAlgonixSession";

const useUserInfo = () => {
  const { isReady } = useAlgonixSession();
  return useQuery({
    queryKey: TRADING_BOTS_QUERY_KEYS.userInfo,
    queryFn: getUserInfo,
    enabled: isReady,
  });
};

export default useUserInfo;
