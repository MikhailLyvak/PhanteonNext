"use client";

/**
 * POST /robots/resume/{id} — resume a paused robot or restart a stopped one.
 *
 * Bound to the Resume button on `RobotDetailCard` when the robot is Paused
 * or Stopped. Resume-from-Stopped consumes a subscription slot — callers
 * must check `robots_active < robots_limit` before invoking and surface the
 * limit modal otherwise. On success, invalidates `userRobots` (state flips
 * to active) and `userInfo` so `robots_active` reflects the new count.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeRobot } from "@/api/TradingBots/endpoints";
import { TRADING_BOTS_QUERY_KEYS } from "@/api/TradingBots/constants";

const useResumeRobot = () => {
  const queryClient = useQueryClient();
  return useMutation<true, Error, string>({
    mutationFn: resumeRobot,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TRADING_BOTS_QUERY_KEYS.userRobots,
      });
      queryClient.invalidateQueries({
        queryKey: TRADING_BOTS_QUERY_KEYS.userInfo,
      });
    },
  });
};

export default useResumeRobot;
