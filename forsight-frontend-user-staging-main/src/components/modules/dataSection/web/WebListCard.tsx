import type { SingleWebRecordType } from "../../../../api/useGetData.types";
import { formatDate, getPlatformLogo } from "../../../../utils/helpers";

import GridCardHeader from "../twitter/GridCardHeader";
import LinksbarGridCard from "../twitter/LinksbarGridCard";
import { FaRegUser } from "react-icons/fa6";
import webImage from "../../../../assets/images/web-bg.png";

function WebListCard({ postRecord }: { postRecord: SingleWebRecordType }) {
  const {
    originalThumbnail,
    targetWebProfile,
    articlePublishedAt,
    articleTitle,
    originalArticleUrl,
    articleSentiment,
    articleDescription,
    uniqueIdentifier,
    thumbnail,
  } = postRecord;

  const { platformName } = targetWebProfile;

  return (
    <div className="bg-white rounded-xl min-h-32 grid grid-cols-[auto_1fr] overflow-hidden dark:text-dark-text dark:bg-dark-bg">
      {/* Image Section */}
      <div className="w-72 aspect-square rounded-r-xl overflow-hidden">
        <img
          src={thumbnail || originalThumbnail || webImage}
          alt="Web Thumbnail"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null; // prevent infinite loop
            e.currentTarget.src = webImage;
          }}
        />
      </div>

      {/* Info Section */}
      <div className="grid content-center grid-cols-1 gap-4 px-8 dark:text-dark-text dark:bg-dark-bg">
        <GridCardHeader
          dataId={uniqueIdentifier}
          platformLogo={getPlatformLogo("web")}
        />
        <div className="w-[300px]">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-4 text-xs bg-white rounded-full 2xl:w-6 aspect-square text-aquagreen-500">
              <FaRegUser />
            </span>
            <p className="text-xs break-all 2xl:text-base">{platformName}</p>
          </div>
        </div>
        <div>
          <p className="text-xs break-all 2xl:text-base">
            {formatDate(articlePublishedAt)}
          </p>
        </div>
        <h3 className="text-sm font-semibold 2xl:text-xl line-clamp-2">
          {articleTitle}
        </h3>
        <p className="line-clamp-2">{articleDescription}</p>

        <div className="flex justify-end">
          <LinksbarGridCard
            platform="web"
            buttonLabel="web"
            dataId={uniqueIdentifier}
            dataLink={originalArticleUrl}
            dataSentiment={articleSentiment}
          />
        </div>
      </div>
    </div>
  );
}

export default WebListCard;
