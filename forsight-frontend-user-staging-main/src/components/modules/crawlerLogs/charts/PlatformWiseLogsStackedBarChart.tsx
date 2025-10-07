import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
// import { getBleed } from "../../../utils/helpers";
// import { sentimentColors } from "../../../utils/constants";
import { useEffect, useState } from "react";
import useGetPlatformsLogsBarChart from "../../../../api/useGetPlatformsLogsBarChart";
import { getBleed } from "../../../../utils/helpers";
import { sentimentColors } from "../../../../utils/constants";
type LogsTypes = {
  startDate: string | null;
  endDate: string | null;
};

function PlatformWiseLogsStackedBarChart({ startDate, endDate }: LogsTypes) {
  const { data, isLoading, isError, error } = useGetPlatformsLogsBarChart({
    startDate,
    endDate,
  });

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

  const platforms = data?.platforms ?? [];

  const positiveSentiments = data?.success ?? [];
  const negativeSentiments = data?.failed ?? [];
  const neutralSentiments = data?.running ?? [];

  const series = [
    {
      name: "Failed",
      data: negativeSentiments,
    },
    {
      name: "Running",
      data: neutralSentiments,
    },
    {
      name: "Success",
      data: positiveSentiments,
    },
  ];

  const options: ApexOptions = {
    xaxis: {
      categories: platforms,
      labels: {
        style: {
          colors: isDarkMode ? "#FFFFFF" : "#000000",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDarkMode ? "#FFFFFF" : "#000000",
        },
      },
    },
    chart: {
      toolbar: {
        show: false,
      },
      foreColor: isDarkMode ? "#FFFFFF" : "#333",
      background: isDarkMode ? "#1e293b" : "#FFFFFF",
    },
    colors: [
      sentimentColors.negative,
      sentimentColors.neutral,
      sentimentColors.positive,
    ],
    legend: {
      labels: {
        colors: isDarkMode ? "#FFFFFF" : "#000000",
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "100%",
        barHeight: "100%",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: [isDarkMode ? "#FFFFFF" : "#000000"], // Ensure values are visible
      },
    },
    tooltip: {
      theme: isDarkMode ? "dark" : "light",
    },
  };

  const innerWidth = window.innerWidth;

  const bleed = getBleed(innerWidth);

  if (isLoading) return <div className="text-center">Loading...</div>;

  if (isError) return <div className="text-center">{error.message}</div>;

  return (
    <div className="border rounded-md overflow-hidden dark:text-dark-text dark:bg-dark-bg">
      {/* <CloseChart chartName="PlatformWiseLogsStackedBarChart" /> */}
      <Chart
        width={innerWidth / 2 - bleed}
        type="bar"
        options={options}
        series={series}
        className="mx-auto"
      />
    </div>
  );
}

export default PlatformWiseLogsStackedBarChart;
