import { FaList } from "react-icons/fa6";
import { MdGridView } from "react-icons/md";
import { ViewType } from "../../utils/typeDefinitions";
import { useLocalStorage } from "@uidotdev/usehooks";
import { browserStorageKeys } from "../../utils/constants";

function ViewSwitchButton() {
  const [viewtype, setViewtype] = useLocalStorage(
    browserStorageKeys.homeDataSectionViewType,
    ViewType.grid
  );

  function handleSetView(view: ViewType) {
    setViewtype(view);
  }
  return (
    <div className="h-6 2xl:h-8 aspect-[4/1] bg-gray-200 grid grid-cols-2 relative rounded-md dark:text-dark-text dark:bg-dark-bg">
      <div
        className="flex items-center justify-center cursor-pointer"
        onClick={() => {
          handleSetView(ViewType.grid);
        }}
      >
        <MdGridView />
      </div>
      <div
        className="flex items-center justify-center cursor-pointer"
        onClick={() => {
          handleSetView(ViewType.list);
        }}
      >
        <FaList />
      </div>
      <div
        className="absolute top-0 bottom-0 transition-all border-2 rounded-md border-aquagreen-500 "
        style={{
          left: viewtype === ViewType.grid ? "0" : "50%",
          right: viewtype === ViewType.grid ? "50%" : "0%",
        }}
      />
    </div>
  );
}

export default ViewSwitchButton;
