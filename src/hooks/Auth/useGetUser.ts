"use client";

import { getProfile } from "@/api/Auth/getProfile";
import { useUserStore } from "@/store/UserData/useUserStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const useGetUser = () => {
  const queryClient = useQueryClient();
  const { setUser, user } = useUserStore();

  const query = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: !user,
  });

  if (query.isSuccess && query.data) {
    setUser(query.data);
    queryClient.setQueryData(["profile"], query.data);
  }

  return query;
};

export default useGetUser;