import type { PlatformType, SentimentType } from "../../utils/typeDefinitions";
import { twMerge } from "tailwind-merge";
import { PiSmileyFill, PiSmileyMehFill, PiSmileySadFill } from "react-icons/pi";
import type { IconType } from "react-icons";
import Portal from "../primitives/Portal";
import UpdateSentimentModal from "../modules/UpdateSentimentModal";
import { useState } from "react";

const emojiMap: Record<SentimentType, IconType> = {
  positive: PiSmileyFill,
  neutral: PiSmileyMehFill,
  negative: PiSmileySadFill,
};

function Sentiment({
  sentiment,
  widthTailwindClass,
  platform,
  dataId,
}: {
  sentiment: SentimentType;
  widthTailwindClass?: string;
  platform: PlatformType;
  dataId: string;
}) {
  const [isUpdateSentimentModalOpen, setIsUpdateSentimentModalOpen] =
    useState(false);

  const SentimentEmoji = emojiMap[sentiment];

  function closeModal() {
    setIsUpdateSentimentModalOpen(false);
  }

  return (
    <div
      className={twMerge(
        "w-8 aspect-square rounded-md flex items-center justify-center bg-gray-300 dark:bg-neutral-700 text-2xl cursor-pointer",
        widthTailwindClass,
        sentiment === "positive" && "text-green-700",
        sentiment === "neutral" && "text-yellow-600",
        sentiment === "negative" && "text-red-700"
      )}
      title="Click to Update sentiment"
      onClick={() => {
        setIsUpdateSentimentModalOpen(true);
      }}
    >
      <SentimentEmoji />
      {isUpdateSentimentModalOpen && (
        <Portal>
          <UpdateSentimentModal
            platform={platform}
            dataId={dataId}
            closeModal={closeModal}
          />
        </Portal>
      )}
    </div>
  );
}

export default Sentiment;
