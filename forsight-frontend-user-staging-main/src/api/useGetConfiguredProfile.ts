import { useQuery } from "@tanstack/react-query";
import { getProfilesUrl } from "./apiConstants";
import {
  GetProfilesApiResponseSchema,
  type GetProfilesApiResponseType,
} from "./useGetConfiguredProfile.types";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getSafeParsedDataAndLogIfError } from "../utils/helpers";
import { primaryRefetchInterval } from "../utils/constants";
// import useGetParamState from "../hooks/useGetParamsState";
// import { useSessionStorage } from "@uidotdev/usehooks";
// import { browserStorageKeys } from "../utils/constants";

export function useGetConfiguredProfile({ enabled }: { enabled: boolean }) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response =
        await axiosPrivate.get<GetProfilesApiResponseType>(getProfilesUrl);

      if (import.meta.env.DEV) {
        return getSafeParsedDataAndLogIfError(
          GetProfilesApiResponseSchema.safeParse(response.data)
        );
      }
      return response.data;
    },
    // enabled: showSideContainer && active === "profile",
    enabled,
    refetchInterval: primaryRefetchInterval,
  });
}
