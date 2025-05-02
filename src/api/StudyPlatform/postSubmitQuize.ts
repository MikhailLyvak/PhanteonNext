import { QuizSubmissionPayload, QuizSubmissionResponse } from "./types";
import axiosInterceptor from '@/interceptor/axiosClient';
import { Cookies } from 'react-cookie';

export async function submitQuizSubmission(
  payload: QuizSubmissionPayload
): Promise<QuizSubmissionResponse> {
  const cookies = new Cookies();
  const token = cookies.get('local_access_token');

  const response = await axiosInterceptor.post(
    '/api/quiz/submission/',
    payload,
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}