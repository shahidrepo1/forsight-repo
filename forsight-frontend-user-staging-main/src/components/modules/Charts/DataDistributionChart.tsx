import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import useGetDistributionData from "../../../api/useGetDistributionData";
import { getBleed } from "../../../utils/helpers";
import CloseChart from "./CloseChart";
import { useEffect, useState } from "react";

function DataDistributionChart() {
  const { data, isLoading, isError, error } = useGetDistributionData();

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  // Update dark mode state dynamically
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

  if (isLoading) return <div className="text-center">Loading...</div>;

  if (isError) return <div className="text-center">{error.message}</div>;

  if (!data) {
    return <div />;
  }

  const keys = ["x", "facebook", "web", "youtube"];

  const series = [
    {
      data: [data.x, data.facebook, data.web, data.youtube],
    },
  ];

  const options: ApexOptions = {
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 10,
        barHeight: "50%",
        borderRadiusApplication: "end",
      },
    },
    xaxis: {
      categories: keys,
      labels: {
        style: {
          colors: isDarkMode ? "#FFFFFF" : "#000000",
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: [isDarkMode ? "#FFFFFF" : "#000000"], // Ensure values are visible
      },
    },
    grid: {
      show: false,
    },
    chart: {
      toolbar: {
        show: false,
      },
      foreColor: isDarkMode ? "#FFFFFF" : "#333",
      background: isDarkMode ? "#1e293b" : "#FFFFFF",
    },
    legend: {
      labels: {
        colors: isDarkMode ? "#FFFFFF" : "#000000",
      },
    },
    tooltip: {
      theme: isDarkMode ? "dark" : "light",
    },
  };
  const innerWidth = window.innerWidth;

  const bleed = getBleed(innerWidth);

  return (
    <div className="flex flex-col bg-white rounded-md  overflow-hidden dark:text-dark-text dark:bg-dark-bg ">
      <CloseChart chartName="DataDistributionChart" />
      <Chart
        width={innerWidth / 2 - bleed}
        type="bar"
        options={options}
        series={series}
        className="mx-auto dark:text-dark-text dark:bg-dark-bg"
      />
    </div>
  );
}

export default DataDistributionChart;
