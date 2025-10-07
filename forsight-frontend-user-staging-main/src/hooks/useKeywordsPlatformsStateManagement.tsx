import { useQueryClient } from "@tanstack/react-query";
import useGetParamState from "./useGetParamsState";
import type { PlatformType } from "../utils/typeDefinitions";

export default function useKeywordsPlatformsStateManagement() {
  const queryClient = useQueryClient();
  const { queryKeysToInvalidateTogether, platformState } = useGetParamState();

  function invalidateCoupledQueries() {
    queryClient
      .invalidateQueries({
        predicate: (query) => {
          return queryKeysToInvalidateTogether.some((key) =>
            query.queryKey.includes(key)
          );
        },
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  function addAllKeywordsToSinglePlatform({
    ids,
    platform,
    searchParams,
  }: {
    ids: Array<string>;
    platform: PlatformType;
    searchParams: URLSearchParams;
  }) {
    searchParams.set(platform, ids.join(","));

    return searchParams;
  }

  function removeAllKeywordsFromSinglePlatform(
    platform: PlatformType,
    searchParams: URLSearchParams
  ) {
    searchParams.delete(platform);

    return searchParams;
  }

  function addSingleKeywordToGivenPlatforms({
    id,
    searchParams,
    platforms,
  }: {
    id: number;
    searchParams: URLSearchParams;
    platforms: Array<PlatformType>;
  }) {
    platforms.forEach((platform) => {
      if (!platformState[platform].includes(String(id))) {
        searchParams.set(platform, [...platformState[platform], id].join(","));
      }
    });

    return searchParams;
  }

  function removeSingleKeywordFromGivenPlatforms({
    id,
    searchParams,
    platforms,
  }: {
    id: number;
    searchParams: URLSearchParams;
    platforms: Array<PlatformType>;
  }) {
    platforms.forEach((platform) => {
      const newPlatformState = platformState[platform]
        .filter((keywordId) => keywordId !== String(id))
        .join(",");

      if (newPlatformState === "") {
        searchParams.delete(platform);
        return;
      }

      searchParams.set(platform, newPlatformState);
    });

    return searchParams;
  }

  return {
    invalidateCoupledQueries,
    addAllKeywordsToSinglePlatform,
    removeAllKeywordsFromSinglePlatform,
    addSingleKeywordToGivenPlatforms,
    removeSingleKeywordFromGivenPlatforms,
  };
}
