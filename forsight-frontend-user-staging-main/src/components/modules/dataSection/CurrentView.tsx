import { ViewType } from "../../../utils/typeDefinitions";
import { useLocalStorage } from "@uidotdev/usehooks";
import { browserStorageKeys } from "../../../utils/constants";
import Listview from "./Listview";
import GridView from "./Gridview";
import type { DataUnionType } from "../../../api/useGetData.types";

function CurrentView({ dataList }: { dataList: Array<DataUnionType> }) {
  const [viewtype] = useLocalStorage(
    browserStorageKeys.homeDataSectionViewType,
    ViewType.grid
  );

  if (viewtype === ViewType.grid) {
    return <GridView dataList={dataList} />;
  }

  return <Listview dataList={dataList} />;
}

export default CurrentView;
