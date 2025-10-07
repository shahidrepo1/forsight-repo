import twitterBG from "../../../../assets/images/twitter-bg.png";
import type { SingleTweetRecordType } from "../../../../api/useGetData.types";
import GridCardHeader from "./GridCardHeader";
import TwitterCardInformation from "./TwitterCardInformation";
import { getPlatformLogo, verifyResourceUrl } from "../../../../utils/helpers";

function TwitterGridCard({
  tweetRecord,
}: {
  tweetRecord: SingleTweetRecordType;
}) {
  const { uniqueIdentifier, tweetImageLink } = tweetRecord;

  return (
    <div
      className="relative p-3 2xl:p-4 bg-cover rounded-2xl 2xl:rounded-3xl aspect-[3/4] overflow-hidden"
      style={{
        backgroundImage: `url(${verifyResourceUrl(tweetImageLink, twitterBG)})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="flex flex-col justify-between w-full h-full">
        <GridCardHeader
          dataId={uniqueIdentifier}
          platformLogo={getPlatformLogo("x")}
        />
        <TwitterCardInformation tweetRecord={tweetRecord} />
      </div>
    </div>
  );
}

export default TwitterGridCard;
