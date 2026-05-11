"use client";

/**
 * POST /robots/pause/{id} — pause a running robot.
 *
 * Bound to the Pause button on `RobotDetailCard` when the robot is Running.
 * Robot stays counted as active (does not free a subscription slot); it just
 * stops opening new trades. On success, invalidates `userRobots` so the
 * detail view re-renders with `paused: true`.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pauseRobot } from "@/api/TradingBots/endpoints";
import { TRADING_BOTS_QUERY_KEYS } from "@/api/TradingBots/constants";

const usePauseRobot = () => {
  const queryClient = useQueryClient();
  return useMutation<true, Error, string>({
    mutationFn: pauseRobot,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TRADING_BOTS_QUERY_KEYS.userRobots,
      });
    },
  });
};

export default usePauseRobot;
