import { IoIosCloseCircleOutline } from "react-icons/io";
import { useManageCharts } from "../../../stores/useManageCharts";

export default function CloseChart({ chartName }: { chartName: string }) {
  const { removeChart } = useManageCharts();
  return (
    <div className="flex p-4 dark:text-dark-text dark:bg-dark-bg">
      <IoIosCloseCircleOutline
        className="ml-auto cursor-pointer text-gray-500 hover:text-gray-700"
        size={30}
        onClick={() => {
          removeChart(chartName);
        }}
      />
    </div>
  );
}
