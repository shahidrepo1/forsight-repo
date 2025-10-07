import type { DataUnionType } from "../../../api/useGetData.types";
import TwitterListCard from "./twitter/TwitterListCard";
import WebListCard from "./web/WebListCard";

import YoutubeListCard from "./youtube/YoutubeListCard";
function Listview({ dataList }: { dataList: Array<DataUnionType> }) {
  return (
    <div className="space-y-4">
      {dataList.map((data) => {
        if (data.platform === "youtube") {
          return <YoutubeListCard key={data.id} postRecord={data} />;
        }

        if (data.platform === "x") {
          return <TwitterListCard key={data.tweetDbId} profile={data} />;
        }
        return <WebListCard key={data.uniqueIdentifier} postRecord={data} />;
      })}
    </div>
  );
}

export default Listview;
