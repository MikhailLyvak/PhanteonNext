import { useMutation } from "@tanstack/react-query";
import { putMyContactData } from "@/api/Auth/putMyContactData";

const usePutMyProfileData = () => {
	return useMutation({
		mutationFn: putMyContactData,
	})
}

export default usePutMyProfileData;
