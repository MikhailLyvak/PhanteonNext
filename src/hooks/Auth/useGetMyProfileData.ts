import { useQuery } from "@tanstack/react-query";
import { getMyContactData } from "@/api/Auth/getMyContactData";

const useGetMyProfileData = () => {
  return useQuery({
    queryKey: ["my-profile-data"],
    queryFn: getMyContactData,
  });
};

export default useGetMyProfileData;
