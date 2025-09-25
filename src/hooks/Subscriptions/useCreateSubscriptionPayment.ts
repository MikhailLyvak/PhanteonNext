import { useMutation } from '@tanstack/react-query';
import { createSubscriptionPayment, SubscriptionPaymentRequest, SubscriptionPaymentResponse } from '../../api/Subscriptions';

export function useCreateSubscriptionPayment() {
  return useMutation<SubscriptionPaymentResponse, Error, SubscriptionPaymentRequest>({
    mutationFn: (data: SubscriptionPaymentRequest) => createSubscriptionPayment(data),
  });
}
