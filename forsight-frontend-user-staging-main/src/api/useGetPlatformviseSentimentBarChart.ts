import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { sentimentBarChartDataUrl } from "./apiConstants";
import useGetParamState from "../hooks/useGetParamsState";
import {
  PlatformviseSentimentApiResponseSchema,
  type PlatformviseSentimentApiResponseType,
} from "./useGetPlatformviseSentimentBarChart.types";
import { getSafeParsedDataAndLogIfError } from "../utils/helpers";
import { useSessionStorage } from "@uidotdev/usehooks";
import { browserStorageKeys, primaryRefetchInterval } from "../utils/constants";
import type { HomePageSectionsType } from "../utils/typeDefinitions";

function useGetPlatformviseSentimentBarChart() {
  const axiosPrivate = useAxiosPrivate();
  const [openedSections] = useSessionStorage<Array<HomePageSectionsType>>(
    browserStorageKeys.openedSection,
    ["data"]
  );

  const { commonQueryKey, generalParams } = useGetParamState();

  return useQuery({
    queryKey: ["sentimentBarChartData", ...commonQueryKey],
    queryFn: async ({ signal }) => {
      const response =
        await axiosPrivate.get<PlatformviseSentimentApiResponseType>(
          sentimentBarChartDataUrl,
          {
            params: generalParams,
            signal,
          }
        );

      if (import.meta.env.DEV) {
        return getSafeParsedDataAndLogIfError(
          PlatformviseSentimentApiResponseSchema.safeParse(response.data)
        );
      }
      return response.data;
    },
    enabled: openedSections.includes("charts"),
    refetchInterval: primaryRefetchInterval,
  });
}

export default useGetPlatformviseSentimentBarChart;
