import { useQuery } from "@tanstack/react-query";
import { getWebinarsList } from "@/api/Webinars/getWebinarsList";

export const useGetWebinarsList = () => {
  return useQuery({
    queryKey: ['webinarsList'],
    queryFn: getWebinarsList,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
