import { submitQuizSubmission } from '@/api/StudyPlatform/postSubmitQuize';
import { QuizSubmissionPayload, QuizSubmissionResponse } from '@/api/StudyPlatform/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';


export function useQuizSubmission() {
  const queryClient = useQueryClient();

  return useMutation<
    QuizSubmissionResponse,
    Error,
    QuizSubmissionPayload
  >({
    mutationFn: (payload: QuizSubmissionPayload) => submitQuizSubmission(payload),

    onSuccess: (data) => {
      console.log('Quiz submission successful:', data);
    },

    onError: (error) => {
      console.error('Quiz submission error:', error);
    },
  });
}