import type { SingleYoutubeRecordType } from "../../../../api/useGetData.types";
import {
  formatDate,
  getPlatformLogo,
  verifyResourceUrl,
} from "../../../../utils/helpers";
import youtubeBG from "../../../../assets/images/YT-bg.png";
import GridCardHeader from "../twitter/GridCardHeader";
import ProfileInformationTwitterCard from "../twitter/ProfileInformationTwitterCard";
import TweetStats from "../twitter/TweetStats";
import LinksbarGridCard from "../twitter/LinksbarGridCard";

function YoutubeListCard({
  postRecord,
}: {
  postRecord: SingleYoutubeRecordType;
}) {
  const {
    thumbnail,
    originalVideoTumbnailUrl,
    uniqueIdentifier,
    targetYoutubeProfile,
    videoPublishedAt,
    videoTitle,
    originalVideoUrl,
    videoSentiment,
  } = postRecord;

  const { channelName, channelSubscribersCount } = targetYoutubeProfile;

  return (
    <div className="bg-white rounded-xl min-h-32 grid grid-cols-[auto_1fr] overflow-hidden dark:text-dark-text dark:bg-dark-bg">
      <div
        className="bg-gray-500 w-72 aspect-square rounded-r-xl "
        style={{
          backgroundImage: `url(${verifyResourceUrl(thumbnail, originalVideoTumbnailUrl ?? youtubeBG)})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      ></div>
      <div className="grid content-center grid-cols-1 gap-4 px-8 dark:text-dark-text dark:bg-dark-bg">
        <GridCardHeader
          dataId={uniqueIdentifier}
          platformLogo={getPlatformLogo("youtube")}
        />
        <div className="w-[300px]">
          <ProfileInformationTwitterCard
            profileName={channelName}
            followersCount={channelSubscribersCount}
          />
        </div>
        <div>
          <p className="text-xs break-all 2xl:text-base">
            {formatDate(videoPublishedAt)}
          </p>
        </div>
        <h3 className="text-sm font-semibold 2xl:text-xl line-clamp-2">
          {videoTitle}
        </h3>
        <TweetStats
          favoriteCount={"0"}
          retweetCount={"0"}
          replyCount={"0"}
          bookmarkCount={"0"}
        />
        <div className="flex justify-end">
          <LinksbarGridCard
            platform="youtube"
            buttonLabel="video"
            dataId={uniqueIdentifier}
            dataLink={originalVideoUrl}
            dataSentiment={videoSentiment}
          />
        </div>
      </div>
    </div>
  );
}

export default YoutubeListCard;
