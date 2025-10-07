import { useInfiniteQuery } from "@tanstack/react-query";
import { keywordsDataUrl, profilesDataUrl } from "./apiConstants";
import { type DataApiResponseType } from "./useGetData.types";
import { useAxiosPrivate } from "./useAxiosPrivate";
import useGetParamState from "../hooks/useGetParamsState";
import { useSessionStorage } from "@uidotdev/usehooks";
import type { HomePageSectionsType } from "../utils/typeDefinitions";
import { browserStorageKeys, primaryRefetchInterval } from "../utils/constants";

const useGetData = () => {
  const axiosPrivate = useAxiosPrivate();
  const { active, generalParams, commonQueryKey } = useGetParamState();

  const url = active === "profile" ? profilesDataUrl : keywordsDataUrl;

  const [openedSection] = useSessionStorage<Array<HomePageSectionsType> | null>(
    browserStorageKeys.openedSection,
    ["data"]
  );

  return useInfiniteQuery({
    queryKey: ["data", ...commonQueryKey],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 0, signal }) => {
      const response = await axiosPrivate.get<DataApiResponseType>(url, {
        params: {
          ...generalParams,
          page: pageParam,
        },
        signal,
      });
      // if (import.meta.env.DEV) {
      //   return getSafeParsedDataAndLogIfError(
      //     DataApiResponseSchema.safeParse(response.data)
      //   );
      // }
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination.current_page;
      const totalPages = lastPage.pagination.total_pages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    refetchInterval: primaryRefetchInterval,
    enabled: openedSection?.includes("data"),
  });
};
export default useGetData;
