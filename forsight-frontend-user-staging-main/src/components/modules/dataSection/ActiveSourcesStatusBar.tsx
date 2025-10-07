import { useSessionStorage } from "@uidotdev/usehooks";
import { useGetConfiguredKeyword } from "../../../api/useGetConfiguredKeyword";
import { useGetConfiguredProfile } from "../../../api/useGetConfiguredProfile";
import useGetParamState from "../../../hooks/useGetParamsState";
import { browserStorageKeys } from "../../../utils/constants";
import type { PlatformType } from "../../../utils/typeDefinitions";
import { RxCross2 } from "react-icons/rx";
import { useSearchParams } from "react-router-dom";
import useKeywordsPlatformsStateManagement from "../../../hooks/useKeywordsPlatformsStateManagement";

function ActiveSourcesStatusBar() {
  const [showSideContainer] = useSessionStorage<boolean>(
    browserStorageKeys.isConfiguratorOpen,
    false
  );

  const {
    active,
    activeProfiles: activeProfilesIds,
    activeKeywords,
  } = useGetParamState();
  const enabled = showSideContainer && active === "keyword";
  const enabledProfile = showSideContainer && active === "profile";
  const { data: keywordData } = useGetConfiguredKeyword({ enabled });
  const { data: profilesData } = useGetConfiguredProfile({
    enabled: enabledProfile,
  });

  const activeProfiles = profilesData?.profiles
    .filter((profile) =>
      activeProfilesIds.includes(profile.targetProfileDbId.toString())
    )
    .map((profile) => profile);

  const keywords = keywordData?.keywords
    .filter((keyword) =>
      activeKeywords.includes(keyword.targetKeywordDbId.toString())
    )
    .map((keyword) => keyword);
  return (
    <details className="mb-4">
      <summary className="text-lg font-semibold text-aquagreen-600 dark:text-dark-text cursor-pointer mb-2">
        {active === "profile" ? "Profile" : "Keyword"} Data View
      </summary>

      <div className="flex flex-wrap items-center gap-4">
        {active === "profile"
          ? activeProfiles?.map((profile) => (
              <ActiveSourceChip
                key={profile.targetProfileDbId}
                active="profile"
                profilePathame={profile.profileUrl}
                platform={profile.platform}
                profileId={profile.targetProfileDbId}
              />
            ))
          : keywords?.map((keyword) => (
              <ActiveSourceChip
                key={keyword.targetKeywordDbId}
                active="keyword"
                keyword={keyword.keyword}
                keywordId={keyword.targetKeywordDbId}
              />
            ))}
      </div>
    </details>
  );
}

export default ActiveSourcesStatusBar;

type ActiveSourcesStatusBarProps =
  | {
      active: "profile";
      profilePathame: string;
      platform: PlatformType;
      profileId: number;
    }
  | {
      active: "keyword";
      keyword: string;
      keywordId: number;
    };
function ActiveSourceChip(props: ActiveSourcesStatusBarProps) {
  const { active } = props;

  const [searchParams, setSearchParams] = useSearchParams();
  const { activeProfiles } = useGetParamState();
  const { removeSingleKeywordFromGivenPlatforms } =
    useKeywordsPlatformsStateManagement();
  const handleDelete = () => {
    if (active === "profile") {
      // console.log(props.profileId, pathname);

      const newProfiles = activeProfiles.filter((profileId) => {
        return profileId !== String(props.profileId);
      });
      if (newProfiles.length === 0) {
        setSearchParams((currentParams) => {
          currentParams.delete("profiles");
          return currentParams;
        });
        return;
      }

      setSearchParams((currentParams) => {
        currentParams.set("profiles", newProfiles.join(","));
        return currentParams;
      });
    } else {
      setSearchParams(
        removeSingleKeywordFromGivenPlatforms({
          id: props.keywordId,
          platforms: ["web", "facebook", "x", "youtube"],
          searchParams,
        })
      );
    }
  };

  const pathname =
    active === "profile" ? new URL(props.profilePathame).pathname : "";
  return (
    <span className="bg-aquagreen-500/70 border-2 border-aquagreen-500 rounded-full px-3 py-0.5 text-white text-center text-xs 2xl:text-base flex justify-center items-center gap-3">
      {active === "profile" ? `${props.platform}${pathname}` : props.keyword}
      <RxCross2
        className="text-red-700 cursor-pointer dark:text-red-400"
        onClick={handleDelete}
        size={18}
      />
    </span>
  );
}
