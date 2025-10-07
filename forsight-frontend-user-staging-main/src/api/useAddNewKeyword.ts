import { useMutation } from "@tanstack/react-query";
import { addNewKeywordUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import type { PlatformType } from "../utils/typeDefinitions";

function useAddNewKeyword() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationKey: ["addNewKeyword"],
    mutationFn: (data: { keyword: string; platforms: Array<PlatformType> }) => {
      return axiosInstance.post(addNewKeywordUrl, data);
    },
  });
}

export default useAddNewKeyword;
