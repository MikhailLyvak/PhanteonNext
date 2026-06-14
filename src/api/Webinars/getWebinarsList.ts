import { Cookies } from 'react-cookie';
import { Webinar } from './types';
import axiosInterceptor from '@/interceptor/axiosClient';

export const getWebinarsList = async (): Promise<Webinar[]> => {
  try {
    const cookies = new Cookies();
    const token = cookies.get('local_access_token');
    
    const config = token
      ? { headers: { Authorization: token } }
      : undefined;

    const data = await axiosInterceptor.get('/api/webinar/list/', config);

    return data.data as Webinar[];
  } catch (error) {
    console.error('Failed to fetch webinars list:', error);
    return [];
  }
};
