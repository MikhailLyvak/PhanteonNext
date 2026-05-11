"use client";

/**
 * DELETE /robots/stop/{id} — stop and remove a robot.
 *
 * Spec §4.9. Variables shape: `string` (the robotId). Bound to the Stop
 * button on `RobotDetailCard`.
 *
 * On success, invalidates the `userRobots` query so the list view drops the
 * stopped robot.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stopRobot } from "@/api/TradingBots/endpoints";
import { TRADING_BOTS_QUERY_KEYS } from "@/api/TradingBots/constants";

const useStopRobot = () => {
  const queryClient = useQueryClient();
  return useMutation<true, Error, string>({
    mutationFn: stopRobot,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TRADING_BOTS_QUERY_KEYS.userRobots,
      });
    },
  });
};

export default useStopRobot;
