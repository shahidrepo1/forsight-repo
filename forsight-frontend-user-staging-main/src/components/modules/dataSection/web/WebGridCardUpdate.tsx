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
    <div className="max-w-sm  overflow-hidden shadow-lg rounded-lg">
      <img
        className="w-full h-48 object-cover"
        src={webRecord.originalThumbnail || webImage}
        alt="Sunset in the mountains"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = webImage;
        }}
      />
      <div className="bg-gradient-to-b from-transparent via-aquagreen-500 to-aquagreen-600 h-full">
        <div className="px-6 py-4  ">
          <GridCardHeader
            dataId={webRecord.uniqueIdentifier}
            platformLogo={getPlatformLogo("web")}
          />
        </div>

        <div className="px-6 pb-4 ">
          <WebCardInformation webRecord={webRecord} />
        </div>
      </div>
    </div>
  );
}
