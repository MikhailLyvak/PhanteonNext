"use client";

/**
 * GET /settings/presets — list of trading-strategy presets.
 *
 * Spec §4.7. Drives `selectPreset()` in Phase B.
 */
import { useQuery } from "@tanstack/react-query";
import { listPresets } from "@/api/TradingBots/endpoints";
import { TRADING_BOTS_QUERY_KEYS } from "@/api/TradingBots/constants";
import { useAlgonixSession } from "./useAlgonixSession";

const usePresets = () => {
  const { isReady } = useAlgonixSession();
  return useQuery({
    queryKey: TRADING_BOTS_QUERY_KEYS.presets,
    queryFn: listPresets,
    enabled: isReady,
  });
};

export default usePresets;
