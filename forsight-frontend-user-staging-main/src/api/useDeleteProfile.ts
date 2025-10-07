import { useMutation } from "@tanstack/react-query";
import { deleteProfileUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

function useDeleteProfile() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["deleteProfile"],
    mutationFn: (profileId: number) => {
      return axiosPrivate.delete(deleteProfileUrl, { data: { profileId } });
    },
  });
}
export default useDeleteProfile;
