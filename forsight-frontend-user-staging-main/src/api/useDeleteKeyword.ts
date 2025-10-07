import { useMutation } from "@tanstack/react-query";
import { deleteKeywordUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

function useDeleteKeyword() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["deleteKeyword"],
    mutationFn: (keywordId: number) => {
      return axiosPrivate.delete(deleteKeywordUrl, { data: { keywordId } });
    },
  });
}
export default useDeleteKeyword;
