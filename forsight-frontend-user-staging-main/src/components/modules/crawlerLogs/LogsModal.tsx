import { IoMdClose } from "react-icons/io";
import FixedInsetZeroDiv from "../../primitives/FixedInsetZeroDiv";
import LogsTable from "./LogsTable";
import DateRangePicker from "../../uiComponents/DatePicker";
import { useState } from "react";
import LogsDonutChart from "./charts/LogsDonutChart";
import PlatformWiseLogsStackedBarChart from "./charts/PlatformWiseLogsStackedBarChart";
import { useClickAway } from "@uidotdev/usehooks";
type LogsModal = {
  setOpen: (prevState: boolean) => void;
  onClose: () => void;
};
const formatDate = (date: Date | null) =>
  date ? date.toISOString().split("T")[0] : null;

export default function LogsModal({ setOpen, onClose }: LogsModal) {
  const [value, setValue] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  } | null>(null);

  const ref = useClickAway(onClose);

  return (
    <FixedInsetZeroDiv>
      <div
        className="bg-white rounded-lg p-4 w-full max-w-7xl  space-y-3 dark:text-dark-text dark:bg-dark-bg min-w-[600px] max-h-[700px] overflow-y-auto scrollbar-thumb-aquagreen-400 scrollbar-thin scrollbar-track-gray-200"
        ref={ref as React.RefObject<HTMLDivElement>}
      >
        <div className="flex justify-between items-center p-2 ">
          <h1 className="font-bold text-aquagreen-600 dark:text-dark-text dark:bg-dark-bg ">
            Crawler Status Overview
          </h1>
          <button
            className="m-2 hover:opacity-75"
            onClick={() => {
              setOpen(false);
            }}
          >
            <IoMdClose />
          </button>
        </div>
        <header>
          <div className="max-w-72 mb-8">
            <DateRangePicker
              value={value}
              onChange={(newValue) => {
                setValue(newValue);
              }}
              placeholder="Select Date Range"
            />
          </div>
        </header>
        <main>
          <div className="flex justify-around my-4">
            <LogsDonutChart
              startDate={formatDate(value?.startDate ?? null)}
              endDate={formatDate(value?.endDate ?? null)}
            />
            <PlatformWiseLogsStackedBarChart
              startDate={formatDate(value?.startDate ?? null)}
              endDate={formatDate(value?.endDate ?? null)}
            />
          </div>
          <LogsTable
            startDate={formatDate(value?.startDate ?? null)}
            endDate={formatDate(value?.endDate ?? null)}
          />
        </main>
      </div>
    </FixedInsetZeroDiv>
  );
}
