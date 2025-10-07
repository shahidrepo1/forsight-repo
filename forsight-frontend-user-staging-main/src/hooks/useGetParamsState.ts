import { useSearchParams } from "react-router-dom";
import type { ConfiguratorSectionsType } from "../utils/typeDefinitions";
import { platformNameKeys } from "../utils/constants";

function useGetParamState() {
  const [searchParams] = useSearchParams();

  const active: ConfiguratorSectionsType =
    (searchParams.get("active") as ConfiguratorSectionsType | null) ??
    "profile";

  const xState = searchParams.get(platformNameKeys.x)?.split(",") ?? [];
  const youtubeState =
    searchParams.get(platformNameKeys.youtube)?.split(",") ?? [];
  const webState = searchParams.get(platformNameKeys.web)?.split(",") ?? [];
  const fbState = searchParams.get(platformNameKeys.facebook)?.split(",") ?? [];

  const activeProfiles = searchParams.get("profiles")?.split(",") ?? [];
  const activeKeywords = [
    ...new Set([...xState, ...youtubeState, ...webState, ...fbState]),
  ];

  const platformState = {
    x: xState,
    youtube: youtubeState,
    web: webState,
    facebook: fbState,
  };

  // FILTERS
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const query = searchParams.get("query") ?? null;
  const sentiments = searchParams.get("sentiments")?.split(",") ?? [];
  const platforms = searchParams.get("platforms")?.split(",") ?? [];

  const isAnyContentActive =
    (active === "profile" && activeProfiles.length > 0) ||
    (active === "keyword" && activeKeywords.length > 0) ||
    sentiments.length > 0;

  function generateSource() {
    if (active === "profile") {
      return activeProfiles.join(",");
    }
    //unnecessary params
    return "34";
  }

  const queryKeysToInvalidateTogether = [
    "data",
    "dataCount",
    "dataDistributionChartData",
    "sentimentDonutChartData",
    "wordcloud",
    "sentimentBarChartData",
  ];

  const commonQueryKey = [
    active,
    ...activeProfiles,
    query,
    startDate,
    endDate,
    ...platforms,
    ...xState,
    ...youtubeState,
    ...webState,
    ...fbState,
    ...sentiments,
  ];

  const generalParams = {
    active,
    source: generateSource(),
    x: xState.length !== 0 ? xState.join(",") : null,
    youtube: youtubeState.length !== 0 ? youtubeState.join(",") : null,
    web: webState.length !== 0 ? webState.join(",") : null,
    facebook: fbState.length !== 0 ? fbState.join(",") : null,
    query,
    startDate: startDate ? startDate.split("T")[0] : null,
    endDate: endDate ? endDate.split("T")[0] : null,
    sentiments:
      sentiments.length === 0
        ? "positive,negative,neutral"
        : sentiments.join(","),
    platforms: platforms.join(","),
  };

  return {
    active,
    activeProfiles,
    activeKeywords,
    startDate,
    endDate,
    query,
    commonQueryKey,
    generalParams,
    queryKeysToInvalidateTogether,
    isAnyContentActive,
    sentiments,
    platformState,
    platforms,
  };
}

export default useGetParamState;
