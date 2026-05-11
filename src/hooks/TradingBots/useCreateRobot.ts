"use client";

/**
 * POST /robots — terminal call of the flow.
 *
 * Spec §4.8. Variables shape: full `RobotsSettingsCreate` (api.id from §4.5,
 * settings.id from §4.7). Returns the new `robotId`.
 *
 * On success, invalidates the `userRobots` query so the landing/list reflects
 * the new robot without a hard refresh.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRobot } from "@/api/TradingBots/endpoints";
import { TRADING_BOTS_QUERY_KEYS } from "@/api/TradingBots/constants";
import type { RobotsSettingsCreate } from "@/api/TradingBots/types";

const useCreateRobot = () => {
  const queryClient = useQueryClient();
  return useMutation<string, Error, RobotsSettingsCreate>({
    mutationFn: createRobot,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TRADING_BOTS_QUERY_KEYS.userRobots,
      });
    },
  });
};

export default useCreateRobot;
