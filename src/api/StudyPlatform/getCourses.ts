import { Cookies } from 'react-cookie';

import { CourseList } from './types';
import axiosInterceptor from '@/interceptor/axiosClient';


export const getCourses = async () => {
  const cookies = new Cookies();
  const token = cookies.get('local_access_token');
  const data = await axiosInterceptor.get('/api/courses/', {
    headers: {
      Authorization: token,
    },
  });

  return data.data as CourseList;
};
