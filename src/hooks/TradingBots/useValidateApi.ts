"use client";

/**
 * POST /apis/validate — validate creds against the exchange.
 *
 * Spec §4.4. Variables shape supports both call modes (see `ValidateApiInput`
 * union):
 *  - Phase A pre-save:  { key, secret, exchange, market_type? }
 *  - Phase B refresh:   { id }
 *
 * On 4xx the mutation rejects and `error` becomes truthy; UI must NOT call
 * `useSaveApi` if validation failed.
 */
import { useMutation } from "@tanstack/react-query";
import { validateApi } from "@/api/TradingBots/endpoints";
import type {
  ValidateApiInput,
  ValidateApiResponse,
} from "@/api/TradingBots/types";

const useValidateApi = () => {
  return useMutation<ValidateApiResponse, Error, ValidateApiInput>({
    mutationFn: validateApi,
  });
};

export default useValidateApi;
