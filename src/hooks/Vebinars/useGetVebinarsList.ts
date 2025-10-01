import { useQuery } from "@tanstack/react-query";
import { getVebinarsList } from "@/api/Vebinars/getVebinarsList";

export const useGetVebinarsList = () => {
  return useQuery({
    queryKey: ['vebinarsList'],
    queryFn: getVebinarsList,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
