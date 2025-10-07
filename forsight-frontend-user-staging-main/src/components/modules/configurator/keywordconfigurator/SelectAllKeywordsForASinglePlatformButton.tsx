import { useSessionStorage } from "@uidotdev/usehooks";
import { useGetConfiguredKeyword } from "../../../../api/useGetConfiguredKeyword";
import useGetParamState from "../../../../hooks/useGetParamsState";
import type { PlatformType } from "../../../../utils/typeDefinitions";
import { browserStorageKeys } from "../../../../utils/constants";
import { useSearchParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { FaCheckCircle } from "react-icons/fa";
import { useTransition } from "react";

function SelectAllKeywordsForASinglePlatformButton({
  platform,
}: {
  platform: PlatformType;
}) {
  const { active } = useGetParamState();
  const [showSideContainer] = useSessionStorage<boolean>(
    browserStorageKeys.isConfiguratorOpen,
    false
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const [isTransitioning, startTransition] = useTransition();

  const enabled = showSideContainer && active === "keyword";
  const { data } = useGetConfiguredKeyword({ enabled });

  const keywordData = data?.keywords;

  const allPlatformsIdsChecked = (() => {
    const enabledKeywordsForPlatform = keywordData
      ?.filter((keyword) =>
        keyword.platforms.some(
          (platformData) =>
            platformData.platform === platform && platformData.enabled
        )
      )
      .map((keyword) => keyword.targetKeywordDbId.toString());

    if (
      !enabledKeywordsForPlatform ||
      enabledKeywordsForPlatform.length === 0
    ) {
      return false;
    }

    return enabledKeywordsForPlatform.every((keywordId) =>
      searchParams.get(platform)?.split(",").includes(keywordId)
    );
  })();

  const handleAllCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;

    startTransition(() => {
      if (isChecked) {
        const selectedKeywordIds = keywordData
          ?.filter((keyword) => {
            return keyword.platforms.some((platformData) => {
              return platformData.platform === platform && platformData.enabled;
            });
          })
          .map((keyword) => keyword.targetKeywordDbId.toString());

        if (selectedKeywordIds && selectedKeywordIds.length > 0) {
          setSearchParams((prevSearchParams) => {
            const currentParams = new URLSearchParams(prevSearchParams);
            currentParams.set(platform, selectedKeywordIds.join(","));
            return currentParams;
          });
        }
      } else {
        setSearchParams((prevSearchParams) => {
          const currentParams = new URLSearchParams(prevSearchParams);
          currentParams.delete(platform);
          return currentParams;
        });
      }
    });
  };

  return (
    <label htmlFor={`${platform}-check`}>
      {isTransitioning && (
        <div className="flex justify-center">
          <div className="w-4 border-2 border-transparent rounded-full aspect-square border-t-aquagreen-500 animate-spin" />
        </div>
      )}

      {!isTransitioning && (
        <>
          <input
            id={`${platform}-check`}
            type="checkbox"
            name="selectAllKeywords"
            checked={allPlatformsIdsChecked}
            onChange={handleAllCheckboxChange}
            className="hidden"
          />
          <p
            className={twMerge(
              "flex justify-center py-2 mb-3 rounded-md text-gray-300 hover:bg-gray-200 active:bg-gray-300 cursor-pointer dark:hover:bg-slate-500",
              allPlatformsIdsChecked &&
                "text-green-800 bg-gray-200 dark:bg-slate-400"
            )}
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)",
            }}
          >
            <FaCheckCircle />
          </p>
        </>
      )}
    </label>
  );
}

export default SelectAllKeywordsForASinglePlatformButton;
