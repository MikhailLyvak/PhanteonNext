
import { getLessonDetail } from "@/api/StudyPlatform/getLessonDetail";
import { useQuery } from "@tanstack/react-query";

export const useGetLessonDetail = (id: string) => {
  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    error,
  } = useQuery({
    queryKey: ["lesson-detail", id],
    queryFn: () => getLessonDetail(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  return { data, refetch, isLoading, isRefetching, error };
};

export default useGetLessonDetail;
