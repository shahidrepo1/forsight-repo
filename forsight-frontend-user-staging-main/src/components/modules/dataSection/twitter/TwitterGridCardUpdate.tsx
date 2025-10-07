import twitterBG from "../../../../assets/images/x.jpg";
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
    <div className="max-w-sm  overflow-hidden shadow-lg rounded-lg">
      <img
        className="w-full h-48 object-cover"
        src={verifyResourceUrl(tweetImageLink, twitterBG)}
        alt="Sunset in the mountains"
      />
      <div className="bg-gradient-to-b from-transparent via-aquagreen-500 to-aquagreen-600">
        <div className="px-6 py-4">
          <GridCardHeader
            dataId={uniqueIdentifier}
            platformLogo={getPlatformLogo("x")}
          />
        </div>

        <div className="px-6 pb-4">
          <TwitterCardInformation tweetRecord={tweetRecord} />
        </div>
      </div>
    </div>
  );
}

export default TwitterGridCard;
