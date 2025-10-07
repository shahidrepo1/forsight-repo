import { useQuery } from "@tanstack/react-query";
import { dataCountUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getSafeParsedDataAndLogIfError } from "../utils/helpers";
import useGetParamState from "../hooks/useGetParamsState";
import {
  DataCountApiResponseSchema,
  type DataCountApiResponseType,
} from "./useGetDataCount.types";
import { useSessionStorage } from "@uidotdev/usehooks";
import { browserStorageKeys, primaryRefetchInterval } from "../utils/constants";
import type { HomePageSectionsType } from "../utils/typeDefinitions";

function useGetDataCount() {
  const axiosPrivate = useAxiosPrivate();
  const [openedSections] = useSessionStorage<Array<HomePageSectionsType>>(
    browserStorageKeys.openedSection,
    ["data"]
  );

  const { commonQueryKey, generalParams } = useGetParamState();

  return useQuery({
    queryKey: ["dataCount", ...commonQueryKey],
    queryFn: async ({ signal }) => {
      const response = await axiosPrivate.get<DataCountApiResponseType>(
        dataCountUrl,
        {
          params: generalParams,
          signal,
        }
      );

      if (import.meta.env.DEV) {
        return getSafeParsedDataAndLogIfError(
          DataCountApiResponseSchema.safeParse(response.data)
        );
      }
      return response.data;
    },
    enabled: openedSections.includes("charts"),
    refetchInterval: primaryRefetchInterval,
  });
}

export default useGetDataCount;
