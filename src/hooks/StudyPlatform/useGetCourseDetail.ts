import { getCourseDetail } from "@/api/StudyPlatform/getCourseDetail";
import { useQuery } from "@tanstack/react-query";

export const useGetCourse = (id: string) => {
  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    error,
  } = useQuery({
    queryKey: ["course-detail", id],
    queryFn: () => getCourseDetail(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  return { data, refetch, isLoading, isRefetching, error };
};

export default useGetCourse;
