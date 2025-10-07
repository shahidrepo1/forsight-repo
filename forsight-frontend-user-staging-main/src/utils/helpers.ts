import { type SafeParseReturnType } from "zod";
import twitterLogo from "../assets/logos/x-logo.png";
import facebookLogo from "../assets/logos/facebook-logo.png";
import webLogo from "../assets/logos/web-logo.png";
import youtubeLogo from "../assets/logos/youtube-logo.png";
import type { PlatformType } from "./typeDefinitions";
import { baseServiceUrl } from "../api/apiConstants";

export function getSafeParsedDataAndLogIfError<T, E>(
  parsedResult: SafeParseReturnType<T, E>
) {
  if (!parsedResult.success) {
    console.error(parsedResult.error.issues);
    throw new Error("Error in parsing response");
  }
  return parsedResult.data;
}

export const getPlatformLogo = (platform: PlatformType) => {
  switch (platform) {
    case "x":
      return twitterLogo;
    case "facebook":
      return facebookLogo;
    case "web":
      return webLogo;
    case "youtube":
      return youtubeLogo;
    default:
      return webLogo;
  }
};
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
): string {
  const date = new Date(dateString);

  const formattedDate = date.toLocaleDateString("en-US", options);

  if (options.day && options.month) {
    return formattedDate.replace(" ", " ");
  }

  return formattedDate;
}
export function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hrs > 0 ? String(hrs) + "h " : ""}${String(mins)}m ${String(secs)}s`;
}
export function getBleed(innerWidth: number) {
  if (innerWidth >= 1920) {
    return 500;
  } else if (innerWidth >= 1280) {
    return 300;
  } else if (innerWidth >= 1024) {
    return 200;
  } else if (innerWidth >= 768) {
    return 100;
  } else {
    return 50;
  }
}

export function verifyResourceUrl(url: string | null, fallback: string) {
  if (url) {
    return `${baseServiceUrl}${url}`;
  }

  return fallback;
}
export function ShortenedText({
  text,
  maxLength,
}: {
  text: string;
  maxLength: number;
}) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
