import { useMutation } from "@tanstack/react-query";
import { deleteFilesUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import useKeywordsPlatformsStateManagement from "../hooks/useKeywordsPlatformsStateManagement";

function useDeleteMultipleData() {
  const axiosInstance = useAxiosPrivate();
  const { invalidateCoupledQueries } = useKeywordsPlatformsStateManagement();

  return useMutation({
    mutationKey: ["deleteMultipleData"],
    mutationFn: function (data: { ids: Array<string> }) {
      return axiosInstance.post(deleteFilesUrl, {
        ids: data.ids.join(","),
      });
    },
    onSuccess: function () {
      invalidateCoupledQueries();
    },
  });
}

export default useDeleteMultipleData;
