import { Cookies } from 'react-cookie';

import { Webinar } from './types';
import axiosInterceptor from '@/interceptor/axiosClient';

export const getLastWebinar = async () => {
  try {
    const cookies = new Cookies();
    const token = cookies.get('local_access_token');
    
    // If no token, return null instead of making the request
    if (!token) {
      return null;
    }
    
    const data = await axiosInterceptor.get('/api/webinar/latest/', {
      headers: {
        Authorization: token,
      },
    });

    return data.data as Webinar;
  } catch (error) {
    console.error('Failed to fetch last webinar:', error);
    return null;
  }
}