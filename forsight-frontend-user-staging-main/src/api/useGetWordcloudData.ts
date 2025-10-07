import { useQuery } from "@tanstack/react-query";
import { wordcloudChartDataUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import useGetParamState from "../hooks/useGetParamsState";
import {
  WordcloudApiResponseSchema,
  type WordcloudApiResponseType,
} from "./useGetWordcloudData.types";
import { useSessionStorage } from "@uidotdev/usehooks";
import type { HomePageSectionsType } from "../utils/typeDefinitions";
import { browserStorageKeys, primaryRefetchInterval } from "../utils/constants";
import { getSafeParsedDataAndLogIfError } from "../utils/helpers";

function useGetWordcloudData() {
  const axiosPrivate = useAxiosPrivate();
  const { commonQueryKey, generalParams } = useGetParamState();

  const [openedSections] = useSessionStorage<Array<HomePageSectionsType>>(
    browserStorageKeys.openedSection,
    ["data"]
  );

  return useQuery({
    queryKey: ["wordcloud", ...commonQueryKey],
    queryFn: async ({ signal }) => {
      const response = await axiosPrivate.get<WordcloudApiResponseType>(
        wordcloudChartDataUrl,
        {
          params: generalParams,
          signal,
        }
      );

      if (import.meta.env.DEV) {
        return getSafeParsedDataAndLogIfError(
          WordcloudApiResponseSchema.safeParse(response.data)
        );
      }

      return response.data;
    },
    refetchInterval: primaryRefetchInterval,
    enabled: openedSections.includes("keywordCloud"),
  });
}

export default useGetWordcloudData;
