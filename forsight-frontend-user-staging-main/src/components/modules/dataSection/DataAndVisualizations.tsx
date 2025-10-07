import Accordion from "../../primitives/Accordion";
import type { HomePageSectionsType } from "../../../utils/typeDefinitions";
import WordcloudContainer from "../Charts/WordcloudContainer";
import { useSessionStorage } from "@uidotdev/usehooks";
import { browserStorageKeys } from "../../../utils/constants";

import ActiveSourcesStatusBar from "./ActiveSourcesStatusBar";
import DataSection from "./DataSection";
import SelectChartsDropdown from "../../uiComponents/SelectChartsDropdown";
import { useManageCharts } from "../../../stores/useManageCharts";
import SentimentDonutChart from "../Charts/SentimentDonutChart";
import PlatformWiseSentimentStackedBarChart from "../Charts/PlatformWiseSentimentStackedBarChart";
import DataDistributionChart from "../Charts/DataDistributionChart";
import DataCount from "../Charts/DataCount";

function DataAndVisualizations() {
  const [openedSections, setOpenedSections] = useSessionStorage<
    Array<HomePageSectionsType>
  >(browserStorageKeys.openedSection, ["data"]);
  const { addedCharts } = useManageCharts();

  function setIsOpen(domain: HomePageSectionsType) {
    if (openedSections.includes(domain)) {
      const newOpenedSections = openedSections.filter(
        (section) => section !== domain
      );
      setOpenedSections(newOpenedSections);
    } else {
      setOpenedSections([...openedSections, domain]);
    }
  }

  return (
    <div className="w-full py-6 space-y-4">
      <ActiveSourcesStatusBar />
      <Accordion
        title="Chart"
        isOpen={openedSections.includes("charts")}
        setIsOpen={setIsOpen}
        domain="charts"
      >
        <SelectChartsDropdown />
        <div className="grid grid-cols-2 gap-2 px-8 2xl:gap-4">
          {addedCharts.includes("SentimentDonutChart") && (
            <SentimentDonutChart />
          )}
          {addedCharts.includes("PlatformWiseSentimentStackedBarChart") && (
            <PlatformWiseSentimentStackedBarChart />
          )}
          {addedCharts.includes("DataDistributionChart") && (
            <DataDistributionChart />
          )}
          {addedCharts.includes("DataCount") && <DataCount />}
        </div>
      </Accordion>
      <Accordion
        title="Word Cloud"
        isOpen={openedSections.includes("keywordCloud")}
        setIsOpen={setIsOpen}
        domain="keywordCloud"
      >
        <WordcloudContainer />
      </Accordion>
      <Accordion
        title="Grid"
        isOpen={openedSections.includes("data")}
        setIsOpen={setIsOpen}
        domain="data"
      >
        <DataSection />
      </Accordion>
    </div>
  );
}

export default DataAndVisualizations;
