import type { PlatformType } from "./typeDefinitions";
export const browserStorageKeys = {
  refreshToken: "refreshToken",
  isConfiguratorOpen: "isConfiguratorOpen",
  openedSection: "openedHomeSection",
  homeDataSectionViewType: "homeDataSectionViewType",
};

export const sentimentColors = {
  positive: "#08c284",
  negative: "#9c341f",
  neutral: "#018ffb",
};

export const ChartsList = [
  "SentimentDonutChart",
  "PlatformWiseSentimentStackedBarChart",
  "DataDistributionChart",
  "DataCount",
];

export const platformNameKeys: Record<PlatformType, PlatformType> = {
  web: "web",
  facebook: "facebook",
  youtube: "youtube",
  x: "x",
};

export const activeParamKeys = {
  profiles: "profiles",
  keywords: "keywords",
};

export const primaryRefetchInterval = 30_000;
