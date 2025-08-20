import { useQuery } from "@tanstack/react-query";
import { getLastVebinar } from "@/api/Vebinars/getLastVebinar";
import { useUserStore } from "@/store/UserData/useUserStore";

export const useGetLastVebinar = () => {
  const user = useUserStore(state => state.user);
  
  return useQuery({
    queryKey: ['lastVebinar'],
    queryFn: getLastVebinar,
    enabled: !!user, // Only run the query when there's a user
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}