import { Cookies } from 'react-cookie';

import { Vebinar } from './types';
import axiosInterceptor from '@/interceptor/axiosClient';

export const getLastVebinar = async () => {
  try {
    const cookies = new Cookies();
    const token = cookies.get('local_access_token');
    
    // If no token, return null instead of making the request
    if (!token) {
      return null;
    }
    
    const data = await axiosInterceptor.get('/api/vebinar/latest/', {
      headers: {
        Authorization: token,
      },
    });

    return data.data as Vebinar;
  } catch (error) {
    console.error('Failed to fetch last vebinar:', error);
    return null;
  }
}