export interface SubscriptionPaymentRequest {
  subscription_type: 'monthly' | 'yearly';
  duration_months: number;
}

export interface SubscriptionPaymentResponse {
  payment: {
    id: number;
    order_reference: string;
    status: 'PENDING' | 'SUCCESS' | 'DECLINED';
    created_at: string;
    user: number;
    subscription: number;
    duration_months: number;
    price: number;
  };
  payment_url: string;
}

export async function createSubscriptionPayment({
  subscription_type,
  duration_months,
}: SubscriptionPaymentRequest): Promise<SubscriptionPaymentResponse> {
  const axiosInterceptor = (await import('@/interceptor/axiosClient')).default;
  const { Cookies } = await import('react-cookie');
  
  const cookies = new Cookies();
  const token = cookies.get('local_access_token');

  const response = await axiosInterceptor.post(
    `/api/subscriptions/payments/create/`,
    { subscription_type, duration_months },
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

// User Subscriptions types and functions
export interface UserSubscription {
  id: number;
  subscription_type: 'monthly' | 'yearly';
  subscription_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_expired: boolean;
  can_renew: boolean;
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
  const axiosInterceptor = (await import('@/interceptor/axiosClient')).default;
  const { Cookies } = await import('react-cookie');
  
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
