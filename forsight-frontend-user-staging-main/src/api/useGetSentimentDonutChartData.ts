import { useQuery } from "@tanstack/react-query";
import { sentimentDonutChartDataUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import {
  SentimentDonutChartDataApiResponseSchema,
  type SentimentDonutChartDataApiResponseType,
} from "./useGetSentimentDonutChartData.types";
import { getSafeParsedDataAndLogIfError } from "../utils/helpers";
import useGetParamState from "../hooks/useGetParamsState";
import { browserStorageKeys } from "../utils/constants";
import type { HomePageSectionsType } from "../utils/typeDefinitions";
import { useSessionStorage } from "@uidotdev/usehooks";

function useGetSentimentDonutChartData() {
  const axiosPrivate = useAxiosPrivate();
  const [openedSections] = useSessionStorage<Array<HomePageSectionsType>>(
    browserStorageKeys.openedSection,
    ["data"]
  );
  const { commonQueryKey, generalParams } = useGetParamState();

  return useQuery({
    queryKey: ["sentimentDonutChartData", ...commonQueryKey],
    queryFn: async ({ signal }) => {
      const response =
        await axiosPrivate.get<SentimentDonutChartDataApiResponseType>(
          sentimentDonutChartDataUrl,
          {
            params: generalParams,
            signal,
          }
        );

      if (import.meta.env.DEV) {
        return getSafeParsedDataAndLogIfError(
          SentimentDonutChartDataApiResponseSchema.safeParse(response.data)
        );
      }
      return response.data;
    },
    enabled: openedSections.includes("charts"),
    refetchInterval: 5_000,
  });
}

export default useGetSentimentDonutChartData;
