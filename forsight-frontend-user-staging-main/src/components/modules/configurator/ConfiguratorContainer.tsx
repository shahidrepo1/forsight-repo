import { FaAngleRight } from "react-icons/fa6";
import Configurators from "./Configurators.tsx";
import { useClickAway, useSessionStorage } from "@uidotdev/usehooks";
import { browserStorageKeys } from "../../../utils/constants.ts";
import { twMerge } from "tailwind-merge";

function ConfiguratorContainer() {
  const [showSideContainer, setShowSideContainer] = useSessionStorage<boolean>(
    browserStorageKeys.isConfiguratorOpen,
    false
  );
  const ref = useClickAway(() => {
    setShowSideContainer(false);
  });

  const handleShowSideContainer = () => {
    setShowSideContainer(false);
  };

  const configuratorWidth = 900;

  const mainDivStyle = {
    width: `${String(configuratorWidth)}px`,
    right: !showSideContainer ? `-${String(configuratorWidth + 50)}px` : "0",
  };

  return (
    <div
      className={twMerge(
        "bg-aquagreen-500 rounded-l-xl z-[2] py-8 px-8 absolute top-0 bottom-0 transition-all",
        "border-l-4 border-aquagreen-800"
      )}
      style={mainDivStyle}
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      <div className="grid h-full pr-0 overflow-hidden bg-white rounded-l-xl dark:bg-dark-bg dark:text-dark-text">
        <Configurators />
      </div>
      <button
        type="button"
        onClick={handleShowSideContainer}
        className="flex items-center justify-center w-10 h-10 border rounded-full cursor-pointer border-aquagreen-500 bg-aquagreen-600"
        style={{
          position: "absolute",
          top: "20px",
          left: "-22px",
        }}
      >
        <FaAngleRight style={{ color: "white", fontSize: "20px" }} />
      </button>
    </div>
  );
}

export default ConfiguratorContainer;
