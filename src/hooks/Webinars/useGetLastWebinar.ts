import { useQuery } from "@tanstack/react-query";
import { getLastWebinar } from "@/api/Webinars/getLastWebinar";
import { useUserStore } from "@/store/UserData/useUserStore";

export const useGetLastWebinar = () => {
  const user = useUserStore(state => state.user);
  
  return useQuery({
    queryKey: ['lastWebinar'],
    queryFn: getLastWebinar,
    enabled: !!user, // Only run the query when there's a user
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}