import type { SingleWebRecordType } from "../../../../api/useGetData.types";
import { getPlatformLogo } from "../../../../utils/helpers";
import GridCardHeader from "../twitter/GridCardHeader";
import WebCardInformation from "./WebCardInformation";
import webImage from "../../../../assets/images/web-bg.png";
export default function WebGridCard({
  webRecord,
}: {
  webRecord: SingleWebRecordType;
}) {
  return (
    <div className="relative p-3 2xl:p-4 rounded-2xl 2xl:rounded-3xl aspect-[3/4] overflow-hidden">
      <img
        src={webRecord.thumbnail || webRecord.originalThumbnail || webImage}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = webImage;
        }}
        className="absolute inset-0 w-full h-full object-cover"
        alt="Web preview"
      />
      <div className="relative flex flex-col justify-between w-full h-full">
        <GridCardHeader
          dataId={webRecord.uniqueIdentifier}
          platformLogo={getPlatformLogo("web")}
        />
        <WebCardInformation webRecord={webRecord} />
      </div>
    </div>
  );
}
