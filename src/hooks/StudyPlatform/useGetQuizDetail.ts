

import { getQuizeDetail } from "@/api/StudyPlatform/getQuizeDetail";
import { useQuery } from "@tanstack/react-query";

export const useGetQuizeDetail = (id: string) => {
  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    error,
  } = useQuery({
    queryKey: ["quiz-detail", id],
    queryFn: () => getQuizeDetail(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  return { data, refetch, isLoading, isRefetching, error };
};

export default useGetQuizeDetail;
