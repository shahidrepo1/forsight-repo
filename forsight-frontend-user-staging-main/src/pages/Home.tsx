import { useRef } from "react";
import DataAndVisualizations from "../components/modules/dataSection/DataAndVisualizations";
import FiltersHeader from "../components/modules/headers/FiltersHeader";
import ScrollToTopButton from "../components/uiComponents/ScrollToTopButton";

function Home() {
  const scrollableDivRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className=" h-full dark:text-dark-text dark:bg-dark-bg overflow-hidden relative">
      <FiltersHeader />
      <div
        className="overflow-auto relative  h-full scrollbar-thumb-aquagreen-400 scrollbar-thin scrollbar-track-gray-200 px-4"
        ref={scrollableDivRef}
      >
        <DataAndVisualizations />
        {/* absolute */}
        <ScrollToTopButton scrollableRef={scrollableDivRef} />
      </div>
    </div>
  );
}

export default Home;
