import { postCkeckPaymentStatus } from '@/api/StudyPlatform/postCheckPayment';
import { PaymentStatusCheckResponse } from '@/api/StudyPlatform/types';
import { useMutation } from '@tanstack/react-query';

type PaymentStatusRequest = {
  courseId: number;
  orderReference: string;
};

export function usePostCkeckPaymentStatus() {
  return useMutation<PaymentStatusCheckResponse, Error, PaymentStatusRequest>({
    mutationFn: postCkeckPaymentStatus,
  });
}
