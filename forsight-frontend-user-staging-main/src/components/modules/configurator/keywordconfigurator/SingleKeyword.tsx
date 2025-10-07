import PlatformsStatus from "./PlatformsStatus";
import type { SingleKeywordRecordType } from "../../../../api/useGetConfiguredKeyword.types";
import { useSearchParams } from "react-router-dom";
import useKeywordsPlatformsStateManagement from "../../../../hooks/useKeywordsPlatformsStateManagement";
import useGetParamState from "../../../../hooks/useGetParamsState";
import { twMerge } from "tailwind-merge";
import DeleteKeywordButton from "./DeleteKeywordButton";
import SuspendKeywordButton from "./SuspendKeywordButton";

function SingleKeyword({
  keywordRecord,
}: {
  keywordRecord: SingleKeywordRecordType;
}) {
  const { keyword, counts, targetKeywordDbId, platforms, suspended } =
    keywordRecord;
  const { totalDataCount } = counts;

  const [searchParams, setSearchParams] = useSearchParams();
  const { platformState } = useGetParamState();
  const {
    addSingleKeywordToGivenPlatforms,
    removeSingleKeywordFromGivenPlatforms,
  } = useKeywordsPlatformsStateManagement();

  const enabledPlatforms = platforms.filter((platform) => platform.enabled);

  const checkIfAlreadySelected = (): boolean => {
    let isTrue = true;

    enabledPlatforms.forEach((platform) => {
      if (
        !platformState[platform.platform].includes(String(targetKeywordDbId))
      ) {
        isTrue = false;
      }
    });

    return isTrue;
  };

  const isAlreadySelected = checkIfAlreadySelected();

  function handleKeywordClick() {
    if (isAlreadySelected) {
      setSearchParams(
        removeSingleKeywordFromGivenPlatforms({
          id: targetKeywordDbId,
          platforms: enabledPlatforms.map((platform) => platform.platform),
          searchParams,
        })
      );
      return;
    }

    setSearchParams(
      addSingleKeywordToGivenPlatforms({
        id: targetKeywordDbId,
        platforms: enabledPlatforms.map((platform) => platform.platform),
        searchParams,
      })
    );
  }

  return (
    <tr className="">
      <td className="">
        <p
          className={twMerge(
            "px-3 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-aquagreen-800 dark:hover:text-aquagreen-50",
            isAlreadySelected &&
              "bg-gray-200 dark:bg-aquagreen-800 dark:text-aquagreen-50"
          )}
          onClick={handleKeywordClick}
        >
          {keyword}
        </p>
      </td>
      <PlatformsStatus platforms={platforms} keywordId={targetKeywordDbId} />
      <td className="text-center">{totalDataCount}</td>
      <td className="flex items-center justify-center">
        <DeleteKeywordButton keywordId={targetKeywordDbId} />
        <SuspendKeywordButton
          suspended={suspended}
          keywordId={targetKeywordDbId}
        />
      </td>
    </tr>
  );
}

export default SingleKeyword;
