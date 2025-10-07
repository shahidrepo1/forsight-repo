import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { dataDistributionChartDataUrl } from "./apiConstants";
import useGetParamState from "../hooks/useGetParamsState";
import { getSafeParsedDataAndLogIfError } from "../utils/helpers";
import {
  DistributionDataApiResponseSchema,
  type DistributionDataApiResponseType,
} from "./useGetDistributionData.types";
import { useSessionStorage } from "@uidotdev/usehooks";
import { browserStorageKeys, primaryRefetchInterval } from "../utils/constants";
import type { HomePageSectionsType } from "../utils/typeDefinitions";

function useGetDistributionData() {
  const axiosPrivate = useAxiosPrivate();
  const [openedSections] = useSessionStorage<Array<HomePageSectionsType>>(
    browserStorageKeys.openedSection,
    ["data"]
  );

  const { commonQueryKey, generalParams } = useGetParamState();

  return useQuery({
    queryKey: ["dataDistributionChartData", ...commonQueryKey],
    queryFn: async ({ signal }) => {
      const response = await axiosPrivate.get<DistributionDataApiResponseType>(
        dataDistributionChartDataUrl,
        {
          params: generalParams,
          signal,
        }
      );

      if (import.meta.env.DEV) {
        return getSafeParsedDataAndLogIfError(
          DistributionDataApiResponseSchema.safeParse(response.data)
        );
      }
      return response.data;
    },
    enabled: openedSections.includes("charts"),
    refetchInterval: primaryRefetchInterval,
  });
}

export default useGetDistributionData;
