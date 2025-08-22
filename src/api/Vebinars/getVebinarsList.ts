import { Cookies } from 'react-cookie';
import { Vebinar } from './types';
import axiosInterceptor from '@/interceptor/axiosClient';

export const getVebinarsList = async (): Promise<Vebinar[]> => {
  try {
    const cookies = new Cookies();
    const token = cookies.get('local_access_token');
    
    // If no token, return empty array instead of making the request
    if (!token) {
      return [];
    }
    
    const data = await axiosInterceptor.get('/api/vebinar/list/', {
      headers: {
        Authorization: token,
      },
    });

    return data.data as Vebinar[];
  } catch (error) {
    console.error('Failed to fetch vebinars list:', error);
    return [];
  }
};
