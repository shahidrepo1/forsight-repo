import { useQuery } from "@tanstack/react-query";
import { getKeywordsUrl } from "./apiConstants";
import {
  GetKeywordsApiResponseSchema,
  type GetKeywordsApiResponseType,
} from "./useGetConfiguredKeyword.types";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getSafeParsedDataAndLogIfError } from "../utils/helpers";
import { primaryRefetchInterval } from "../utils/constants";
// import useGetParamState from "../hooks/useGetParamsState";
// import { browserStorageKeys } from "../utils/constants";
// import { useSessionStorage } from "@uidotdev/usehooks";

export function useGetConfiguredKeyword({ enabled }: { enabled: boolean }) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["keywords"],
    queryFn: async () => {
      const response =
        await axiosPrivate.get<GetKeywordsApiResponseType>(getKeywordsUrl);
      if (import.meta.env.DEV) {
        return getSafeParsedDataAndLogIfError(
          GetKeywordsApiResponseSchema.safeParse(response.data)
        );
      }
      return response.data;
    },
    // enabled: showSideContainer && active === "keyword",
    enabled,
    refetchInterval: primaryRefetchInterval,
  });
}
