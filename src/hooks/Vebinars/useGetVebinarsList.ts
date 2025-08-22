import { useQuery } from "@tanstack/react-query";
import { getVebinarsList } from "@/api/Vebinars/getVebinarsList";
import { useUserStore } from "@/store/UserData/useUserStore";

export const useGetVebinarsList = () => {
  const user = useUserStore(state => state.user);
  
  return useQuery({
    queryKey: ['vebinarsList'],
    queryFn: getVebinarsList,
    enabled: !!user, // Only run the query when there's a user
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
