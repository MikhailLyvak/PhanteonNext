"use client";

/**
 * POST /apis — persist a validated API key.
 *
 * Spec §4.5. Call AFTER `useValidateApi` succeeds. Returns the new `apiId`.
 *
 * On success the cached `useUserApis` query is invalidated so subsequent
 * reads reflect the new key.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveApi } from "@/api/TradingBots/endpoints";
import { TRADING_BOTS_QUERY_KEYS } from "@/api/TradingBots/constants";
import type { SaveApiInput } from "@/api/TradingBots/types";

const useSaveApi = () => {
  const qc = useQueryClient();
  return useMutation<string, Error, SaveApiInput>({
    mutationFn: saveApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRADING_BOTS_QUERY_KEYS.userApis });
    },
  });
};

export default useSaveApi;
