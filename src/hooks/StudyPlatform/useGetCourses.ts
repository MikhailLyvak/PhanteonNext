import { getCourses } from "@/api/StudyPlatform/getCourses";
import { useQuery } from "@tanstack/react-query";

export const useGetCourses = () => {
  const { data, refetch, isLoading, isRefetching } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    refetchOnWindowFocus: false,
  });

  return { data, refetch, isLoading, isRefetching };
};

export default useGetCourses;
