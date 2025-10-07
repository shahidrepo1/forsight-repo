import { FaRegUser } from "react-icons/fa6";
import type { SingleWebRecordType } from "../../../../api/useGetData.types";
import { formatDate } from "../../../../utils/helpers";
import LinksbarGridCard from "../twitter/LinksbarGridCard";

function isRTL(text: string) {
  const rtlCharRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/; // Arabic/Urdu range
  return rtlCharRegex.test(text);
}

export default function WebCardInformation({
  webRecord,
}: {
  webRecord: SingleWebRecordType;
}) {
  return (
    <div className="p-1 space-y-2 text-sm text-black transition-all duration-500 bg-white rounded-md dark:text-dark-text dark:bg-dark-bg">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-4 text-xs bg-white rounded-full 2xl:w-6 aspect-square text-aquagreen-500 dark:text-dark-text dark:bg-dark-bg">
          <FaRegUser />
        </span>
        <p className="text-xs break-all 2xl:text-base ">
          {webRecord.targetWebProfile.platformName}
        </p>
      </div>
      <div>
        <p className="text-xs break-all 2xl:text-base">
          {webRecord.articlePublishedAt &&
            formatDate(webRecord.articlePublishedAt)}
        </p>
      </div>
      <h3
        className="text-sm font-semibold 2xl:text-xl line-clamp-1"
        dir={isRTL(webRecord.articleTitle) ? "rtl" : "ltr"}
      >
        {webRecord.articleTitle}
      </h3>
      <div className="h-6"></div>
      <LinksbarGridCard
        platform="web"
        buttonLabel="web"
        dataId={webRecord.uniqueIdentifier}
        dataLink={webRecord.originalArticleUrl}
        dataSentiment={webRecord.articleSentiment}
      />
    </div>
  );
}
