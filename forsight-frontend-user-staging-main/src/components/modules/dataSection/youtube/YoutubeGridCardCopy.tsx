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
    <div className="max-w-sm  overflow-hidden shadow-lg rounded-lg">
      <img
        className="w-full h-48 object-cover"
        src={verifyResourceUrl(
          thumbnail,
          originalVideoTumbnailUrl ?? youtubeBG
        )}
        alt="Sunset in the mountains"
      />
      <div className="bg-gradient-to-b from-transparent via-aquagreen-500 to-aquagreen-600">
        <div className="px-6 py-4 ">
          <GridCardHeader
            dataId={uniqueIdentifier}
            platformLogo={getPlatformLogo("youtube")}
          />
        </div>

        <div className="px-6 pb-4">
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
            <h3 className="text-sm font-semibold 2xl:text-xl line-clamp-1">
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
    </div>
  );
}

export default YoutubeGridCard;
