import { useQuery } from "@tanstack/react-query";
import { getLastVebinar } from "@/api/Vebinars/getLastVebinar";

export const useGetLastVebinar = () => {
  return useQuery({
    queryKey: ['lastVebinar'],
    queryFn: getLastVebinar,
  });
}