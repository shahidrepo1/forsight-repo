import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { updateSentimentUrl } from "./apiConstants";
import type { PlatformType, SentimentType } from "../utils/typeDefinitions";

type UpdateSentimentData = {
  dataId: string;
  sentiment: SentimentType;
  platform: PlatformType;
};

function useUpdateSentiment() {
  const axiosPrivate = useAxiosPrivate();

  return useMutation({
    mutationKey: ["updateSentiment"],
    mutationFn: (data: UpdateSentimentData) => {
      const { dataId, platform, sentiment } = data;

      return axiosPrivate.patch(
        `${updateSentimentUrl}${platform}/${String(dataId)}/`,
        {
          sentiment,
        }
      );
    },
  });
}

export default useUpdateSentiment;
