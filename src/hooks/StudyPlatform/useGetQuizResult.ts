import { getQuizResult } from '@/api/StudyPlatform/getQuizResult';
import { QuizResult } from '@/api/StudyPlatform/types';
import { useQuery } from '@tanstack/react-query';

export function useGetQuizResult(lessonId: string) {
  return useQuery<QuizResult>({
    queryKey: ['quiz-result', lessonId],
    queryFn: () => getQuizResult(lessonId),
    enabled: !!lessonId,
    retry: false, // Don't retry if no result found
  });
} 