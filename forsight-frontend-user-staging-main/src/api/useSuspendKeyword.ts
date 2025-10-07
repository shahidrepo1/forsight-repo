import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { suspendKeywordUrl } from "./apiConstants";

type SuspendKeywordProps = {
  keywordId: number;
  suspended: boolean;
};

export default function useSuspendKeyword() {
  const axiosPrivate = useAxiosPrivate();

  return useMutation({
    mutationKey: ["suspendKeyword"],
    mutationFn: async (data: SuspendKeywordProps) => {
      return axiosPrivate.post(suspendKeywordUrl, data);
    },
  });
}
