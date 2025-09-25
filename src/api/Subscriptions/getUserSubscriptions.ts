import axiosInterceptor from '@/interceptor/axiosClient';
import { Cookies } from 'react-cookie';

export interface UserSubscription {
  id: number;
  subscription_type: 'monthly' | 'yearly';
  subscription_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  payment: {
    id: number;
    price: number;
    duration_months: number;
    status: 'PENDING' | 'SUCCESS' | 'DECLINED';
    created_at: string;
  };
}

export interface UserSubscriptionsResponse {
  subscriptions: UserSubscription[];
  has_active_subscription: boolean;
}

export async function getUserSubscriptions(): Promise<UserSubscriptionsResponse> {
  const cookies = new Cookies();
  const token = cookies.get('local_access_token');

  const response = await axiosInterceptor.get(
    `/api/user-subscriptions/`,
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

