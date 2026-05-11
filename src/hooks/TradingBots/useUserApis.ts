"use client";

/**
 * GET /apis — saved API keys for the current user.
 *
 * Spec §4.2. Used to detect "user already has an API for exchange X" → skip
 * Phase A and jump straight to robot config with the existing apiId.
 */
import { useQuery } from "@tanstack/react-query";
import { listApis } from "@/api/TradingBots/endpoints";
import { TRADING_BOTS_QUERY_KEYS } from "@/api/TradingBots/constants";
import { useAlgonixSession } from "./useAlgonixSession";

const useUserApis = () => {
  const { isReady } = useAlgonixSession();
  return useQuery({
    queryKey: TRADING_BOTS_QUERY_KEYS.userApis,
    queryFn: listApis,
    enabled: isReady,
  });
};

export default useUserApis;
