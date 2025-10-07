import type { SingleTweetRecordType } from "../../../../api/useGetData.types";
import TweetStats from "./TweetStats";
import ProfileInformationTwitterCard from "./ProfileInformationTwitterCard";
import { formatDate } from "../../../../utils/helpers";
import LinksbarGridCard from "./LinksbarGridCard";

function TwitterCardInformation({
  tweetRecord,
}: {
  tweetRecord: SingleTweetRecordType;
}) {
  const {
    targetXProfile: { targetProfileScreenName, targetProfileFollowersCount },
    tweetCreatedAt,
    tweetText,
    tweetFavoriteCount,
    retweetCount,
    tweetReplies,
    tweetBookmarkCount,
    tweetOriginalLink,
    tweetSentiment,
    uniqueIdentifier,
  } = tweetRecord;

  return (
    <div className="p-1 space-y-2 text-sm text-black transition-all duration-500 rounded-md bg-white dark:text-dark-text dark:bg-dark-bg">
      <ProfileInformationTwitterCard
        profileName={targetProfileScreenName}
        followersCount={targetProfileFollowersCount ?? ""}
      />
      <div>
        <p className="text-xs break-all 2xl:text-base">
          {formatDate(tweetCreatedAt)}
        </p>
      </div>
      <h3 className="text-sm font-semibold 2xl:text-xl line-clamp-1 font-jameel">
        {tweetText}
      </h3>
      <TweetStats
        favoriteCount={tweetFavoriteCount ?? ""}
        retweetCount={retweetCount ?? ""}
        replyCount={tweetReplies ?? ""}
        bookmarkCount={tweetBookmarkCount ?? ""}
      />
      <LinksbarGridCard
        platform="x"
        buttonLabel="tweet"
        dataId={uniqueIdentifier}
        dataLink={tweetOriginalLink ?? ""}
        dataSentiment={tweetSentiment}
      />
    </div>
  );
}

export default TwitterCardInformation;
