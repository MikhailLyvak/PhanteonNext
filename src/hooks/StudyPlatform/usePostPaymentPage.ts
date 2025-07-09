import { postPaymentPage } from '@/api/StudyPlatform/postPaymentPage';
import { PaymentResponse } from '@/api/StudyPlatform/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';


export function usePostPaymentPage() {
  const queryClient = useQueryClient();

  return useMutation<
    PaymentResponse,
    Error,
    { courseId: number; promocode?: string }
  >({
    mutationFn: ({ courseId, promocode }) => postPaymentPage({ courseId, promocode }),
  });
}