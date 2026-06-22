import { useMutation } from "@tanstack/react-query";
import { postChangePassword } from "@/api/Auth/postChangePassword";

const useChangePassword = () => {
  return useMutation({
    mutationFn: postChangePassword,
  });
};

export default useChangePassword;
