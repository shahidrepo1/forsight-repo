import type { DataUnionType } from "../../../api/useGetData.types";
import TwitterGridCard from "./twitter/TwitterGridCardUpdate";
import WebGridCard from "./web/WebGridCardUpdate";
import YoutubeGridCard from "./youtube/YoutubeGridCardCopy";

function GridView({ dataList }: { dataList: Array<DataUnionType> }) {
  return (
    <div className=" grid w-full gap-4 px-1 py-1 2xl:gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 dark:text-dark-text dark:bg-dark-bg">
      {dataList.map((data) => {
        if (data.platform === "youtube") {
          return <YoutubeGridCard key={data.id} postRecord={data} />;
        } else if (data.platform === "x") {
          return (
            <TwitterGridCard key={data.uniqueIdentifier} tweetRecord={data} />
          );
        } else {
          return <WebGridCard key={data.webRecordDbId} webRecord={data} />;
        }
      })}
    </div>
  );
}

export default GridView;
