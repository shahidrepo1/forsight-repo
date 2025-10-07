import { useMutation } from "@tanstack/react-query";
import { addNewProfileUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

function useAddNewProfile() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationKey: ["addNewProfile"],
    mutationFn: (data: { profile: string }) => {
      return axiosInstance.post(addNewProfileUrl, data);
    },
  });
}

export default useAddNewProfile;
