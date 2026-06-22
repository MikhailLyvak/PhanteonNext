import { useMutation } from "@tanstack/react-query";
import { deleteAccount } from "@/api/Auth/deleteAccount";

const useDeleteAccount = () => {
  return useMutation({
    mutationFn: deleteAccount,
  });
};

export default useDeleteAccount;
