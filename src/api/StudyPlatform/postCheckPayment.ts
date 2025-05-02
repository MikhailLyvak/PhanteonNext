import axiosInterceptor from '@/interceptor/axiosClient';
import { Cookies } from 'react-cookie';
import { PaymentStatusCheckResponse } from './types';

type PaymentStatusRequest = {
  courseId: number;
  orderReference: string;
};

export async function postCkeckPaymentStatus({
  courseId,
  orderReference,
}: PaymentStatusRequest): Promise<PaymentStatusCheckResponse> {
  const response = await axiosInterceptor.post(
    `/api/payments/check/${courseId}/${orderReference}/`,
    {},
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return response.data;
}
