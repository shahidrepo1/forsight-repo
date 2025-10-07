import Chart from "react-apexcharts";
// import useGetSentimentDonutChartData from "../../../api/useGetSentimentDonutChartData";
import type { ApexOptions } from "apexcharts";
// import { getBleed } from "../../../utils/helpers";
// import { sentimentColors } from "../../../utils/constants";
// import CloseChart from "./CloseChart";
import { useEffect, useState } from "react";
import useGetLogsDonutChartData from "../../../../api/useGetLogsDonutChartData";
import { getBleed } from "../../../../utils/helpers";
import { sentimentColors } from "../../../../utils/constants";

type LogsTypes = {
  startDate: string | null;
  endDate: string | null;
};

const LogsDonutChart = ({ startDate, endDate }: LogsTypes) => {
  const { data, isLoading, isError, error } = useGetLogsDonutChartData({
    startDate,
    endDate,
  });

  const series = [data?.FAILED ?? 0, data?.RUNNING ?? 0, data?.SUCCESS ?? 0];
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);
  // const series = data?.data.map((item) => item.count) ?? [];

  const options: ApexOptions = {
    labels: ["Failed", "Running", "Success"],
    colors: [
      sentimentColors.negative,
      sentimentColors.neutral,
      sentimentColors.positive,
    ],
    dataLabels: {
      style: {
        colors: isDarkMode
          ? ["#FFFFFF", "#FFFFFF", "#FFFFFF"]
          : ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
      },
    },
    legend: {
      labels: {
        colors: isDarkMode ? "#FFFFFF" : "#000000",
      },
    },
    stroke: {
      show: true,
      width: 1,
      colors: [isDarkMode ? "#B0B0B0" : "#D0D0D0"],
    },
  };

  if (isLoading) return <div className="text-center">Loading...</div>;

  if (isError) return <div className="text-center">{error.message}</div>;

  const innerWidth = window.innerWidth;

  const bleed = getBleed(innerWidth);

  return (
    <div
      id="chart"
      className="flex flex-col border rounded-md overflow-hidden dark:text-dark-text dark:bg-dark-bg"
    >
      {/* <CloseChart chartName="LogsDonutChart" /> */}
      <Chart
        options={options}
        series={series}
        type="donut"
        width={innerWidth / 2 - bleed}
        className="mx-auto"
      />
    </div>
  );
};

export default LogsDonutChart;
