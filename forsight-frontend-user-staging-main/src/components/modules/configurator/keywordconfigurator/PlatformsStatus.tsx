import { useSearchParams } from "react-router-dom";
import type { SinglePlatformRecordType } from "../../../../api/useGetConfiguredKeyword.types";
import useGetParamState from "../../../../hooks/useGetParamsState";
import PlatformSelectableChip from "./PlatformSelectableChip";

function PlatformsStatus({
  platforms,
  keywordId,
}: {
  platforms: Array<SinglePlatformRecordType>;
  keywordId: number;
}) {
  return (
    <>
      {platforms.map((platformRecord) => {
        return (
          <SinglePlatform
            key={platformRecord.platform}
            platformRecord={platformRecord}
            keywordId={keywordId}
          />
        );
      })}
    </>
  );
}

export default PlatformsStatus;

function SinglePlatform({
  platformRecord,
  keywordId,
}: {
  platformRecord: SinglePlatformRecordType;
  keywordId: number;
}) {
  const [, setSearchParams] = useSearchParams();
  const { activeKeywords, platformState } = useGetParamState();

  const { enabled, platform, status } = platformRecord;

  const currentPlatformState = platformState[platform];

  function isAlreadySelected() {
    return currentPlatformState.includes(String(keywordId));
  }

  function deletePlatformKey() {
    setSearchParams((currentParams) => {
      currentParams.delete(platform);
      return currentParams;
    });
  }

  function removeFromPlatform() {
    const newSelectedIdsInCurrentPlatform = currentPlatformState.filter(
      (kwdId) => kwdId !== String(keywordId)
    );

    if (newSelectedIdsInCurrentPlatform.length === 0) {
      deletePlatformKey();
      return;
    }

    setSearchParams((currentParams) => {
      currentParams.set(platform, newSelectedIdsInCurrentPlatform.join(","));

      return currentParams;
    });
  }

  function addToPlatform() {
    setSearchParams((currentParams) => {
      currentParams.set(
        platform,
        [...currentPlatformState, String(keywordId)].join(",")
      );

      return currentParams;
    });
  }

  function handleClick() {
    if (isAlreadySelected()) {
      removeFromPlatform();
    } else {
      addToPlatform();
    }
  }

  const isSelected =
    activeKeywords.includes(String(keywordId)) &&
    currentPlatformState.includes(String(keywordId));

  return (
    <td className="px-2 py-1">
      <div className="grid w-full">
        <PlatformSelectableChip
          platformLabel={platform}
          platformValue={platform}
          isSelected={isSelected}
          onClick={handleClick}
          enabled={enabled}
          isDown={!status}
        />
      </div>
    </td>
  );
}
