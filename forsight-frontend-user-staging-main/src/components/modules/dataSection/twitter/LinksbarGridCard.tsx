import { useNavigate } from "react-router-dom";
import type {
  PlatformType,
  SentimentType,
} from "../../../../utils/typeDefinitions";
import Sentiment from "../../../uiComponents/Sentiment";

function LinksbarGridCard({
  platform,
  dataLink,
  dataSentiment,
  dataId,
  buttonLabel,
}: {
  platform: PlatformType;
  dataLink: string;
  dataSentiment: SentimentType;
  dataId: string;
  buttonLabel: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="space-x-2">
        <a
          href={dataLink}
          target="_blank"
          className="text-xs 2xl:text-base hover:underline"
        >
          {buttonLabel}
        </a>
        <button
          type="button"
          className="px-2 py-0.5 2xl:py-1 text-xs  rounded-md 2xl:rounded-lg 2xl:px-3 hover:text-black hover:bg-gray-400 2xl:text-base dark:bg-dark-bg dark:text-dark-text dark:hover:bg-aquagreen-500"
          onClick={() => {
            navigate(`/data/${platform}/${dataId.toString()}`);
          }}
        >
          view
        </button>
      </div>
      <Sentiment
        dataId={dataId}
        platform={platform}
        sentiment={dataSentiment}
        widthTailwindClass="w-6 2xl:w-8 text-lg 2xl:text-2xl"
      />
    </div>
  );
}

export default LinksbarGridCard;
