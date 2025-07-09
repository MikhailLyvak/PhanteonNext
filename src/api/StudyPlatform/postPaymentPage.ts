import axiosInterceptor from '@/interceptor/axiosClient';
import { Cookies } from 'react-cookie';
import { PaymentResponse } from './types';

export async function postPaymentPage({ courseId, promocode }: { courseId: number; promocode?: string }): Promise<PaymentResponse> {
  const cookies = new Cookies();
  const token = cookies.get('local_access_token');

  const response = await axiosInterceptor.post(
    `/api/payments/create/${courseId}/`,
    promocode ? { promocode } : {},
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}
