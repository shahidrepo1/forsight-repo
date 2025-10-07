import { type LegacyRef, useState } from "react";
import { IoMdArrowDropup } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { IoMdRemove } from "react-icons/io";
import { useManageCharts } from "../../stores/useManageCharts";
import { ChartsList } from "../../utils/constants";
import { useClickAway } from "@uidotdev/usehooks";

function MultiSelectDropdown() {
  const { addedCharts, addChart, removeChart } = useManageCharts();
  const [isOpen, setIsOpen] = useState(false);

  const isChartAdded = (ChartComponent: string) =>
    addedCharts.includes(ChartComponent);

  const handleToggleChart = (ChartComponent: string) => {
    if (isChartAdded(ChartComponent)) {
      removeChart(ChartComponent);
    } else {
      addChart(ChartComponent);
    }
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };
  const ref = useClickAway(() => {
    setIsOpen(false);
  });
  return (
    <div className="flex px-8 pb-4">
      <div
        className="relative inline-block w-[400px] ml-auto"
        ref={ref as LegacyRef<HTMLDivElement> | undefined}
      >
        <button
          onClick={toggleDropdown}
          className={`w-full py-[2px] text-sm font-medium px-4 text-left flex justify-between items-center focus:outline-none border rounded-lg shadow border-aquagreen-500 h-fit
            ${isOpen ? "bg-aquagreen-50 dark:bg-aquagreen-900" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          <span>Select Charts</span>
          <span>
            {isOpen ? (
              <IoMdArrowDropup size={30} />
            ) : (
              <IoMdArrowDropdown size={30} />
            )}
          </span>
        </button>
        {isOpen && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto dark:text-dark-text dark:bg-dark-bg">
            {ChartsList.map((chart, index) => (
              <li
                key={index}
                className={`flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-aquagreen-800`}
              >
                <span>{chart}</span>
                <button
                  onClick={() => {
                    handleToggleChart(chart);
                  }}
                  className={`text-blue-500 ${
                    isChartAdded(chart) ? "text-red-500" : "text-blue-500"
                  }`}
                >
                  {isChartAdded(chart) ? <IoMdRemove /> : <IoMdAdd />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MultiSelectDropdown;
