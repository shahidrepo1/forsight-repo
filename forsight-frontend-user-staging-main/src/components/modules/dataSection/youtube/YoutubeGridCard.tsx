import {
  formatDate,
  getPlatformLogo,
  verifyResourceUrl,
} from "../../../../utils/helpers";
import youtubeBG from "../../../../assets/images/YT-bg.png";
import type { SingleYoutubeRecordType } from "../../../../api/useGetData.types";
import GridCardHeader from "../twitter/GridCardHeader";
import InformationSectionGridCard from "./InformationSectionGridCard";
import ProfileInformationTwitterCard from "../twitter/ProfileInformationTwitterCard";
import TweetStats from "../twitter/TweetStats";
import LinksbarGridCard from "../twitter/LinksbarGridCard";

function YoutubeGridCard({
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
    <div
      className="relative p-3 2xl:p-4 bg-cover rounded-2xl 2xl:rounded-3xl aspect-[3/4] overflow-hidden"
      style={{
        backgroundImage: `url(${verifyResourceUrl(thumbnail, originalVideoTumbnailUrl ?? youtubeBG)})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="flex flex-col justify-between w-full h-full ">
        <GridCardHeader
          dataId={uniqueIdentifier}
          platformLogo={getPlatformLogo("youtube")}
        />
        <InformationSectionGridCard>
          <ProfileInformationTwitterCard
            profileName={channelName}
            followersCount={channelSubscribersCount}
          />
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
          <LinksbarGridCard
            platform="youtube"
            buttonLabel="video"
            dataId={uniqueIdentifier}
            dataLink={originalVideoUrl}
            dataSentiment={videoSentiment}
          />
        </InformationSectionGridCard>
      </div>
    </div>
  );
}

export default YoutubeGridCard;
