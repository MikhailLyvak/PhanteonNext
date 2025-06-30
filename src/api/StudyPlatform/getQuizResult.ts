import { QuizResult } from "./types";
import axiosInterceptor from '@/interceptor/axiosClient';
import { Cookies } from 'react-cookie';

export async function getQuizResult(lessonId: string): Promise<QuizResult> {
  const cookies = new Cookies();
  const token = cookies.get('local_access_token');

  const response = await axiosInterceptor.get(
    `/api/quiz/result/${lessonId}/`,
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
} 