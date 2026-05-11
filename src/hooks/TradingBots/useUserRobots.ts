"use client";

/**
 * GET /statistics/robots/users — current user's robots.
 *
 * Replaces the previous Zustand `createdRobots` list. Single source of truth
 * for the robots list, the detail card, and the landing decision tree.
 *
 * Gated by `useAlgonixSession.isReady` so the request waits for the
 * Authorization header to be installed.
 */
import { useQuery } from "@tanstack/react-query";
import { listUserRobots } from "@/api/TradingBots/endpoints";
import { TRADING_BOTS_QUERY_KEYS } from "@/api/TradingBots/constants";
import { useAlgonixSession } from "./useAlgonixSession";

const useUserRobots = () => {
  const { isReady } = useAlgonixSession();
  return useQuery({
    queryKey: TRADING_BOTS_QUERY_KEYS.userRobots,
    queryFn: listUserRobots,
    enabled: isReady,
  });
};

export default useUserRobots;
