"use client";

/**
 * DELETE /apis/{id} — remove a saved API key.
 *
 * Spec §4.6. Variables shape: `string` (the apiId). Returns `true` on
 * success.
 *
 * Invalidates `useUserApis` on success so the list updates.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteApi } from "@/api/TradingBots/endpoints";
import { TRADING_BOTS_QUERY_KEYS } from "@/api/TradingBots/constants";

const useDeleteApi = () => {
  const qc = useQueryClient();
  return useMutation<true, Error, string>({
    mutationFn: deleteApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRADING_BOTS_QUERY_KEYS.userApis });
    },
  });
};

export default useDeleteApi;
