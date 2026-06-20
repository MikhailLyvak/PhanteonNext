import { useMutation } from "@tanstack/react-query";
import { postChangeLogin } from "@/api/Auth/postChangeLogin";

const useChangeLogin = () => {
  return useMutation({
    mutationFn: postChangeLogin,
  });
};

export default useChangeLogin;
