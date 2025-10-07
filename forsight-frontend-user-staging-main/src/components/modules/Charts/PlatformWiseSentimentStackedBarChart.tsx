import Chart from "react-apexcharts";
import useGetPlatformviseSentimentBarChart from "../../../api/useGetPlatformviseSentimentBarChart";
import type { ApexOptions } from "apexcharts";
import { getBleed } from "../../../utils/helpers";
import { sentimentColors } from "../../../utils/constants";
import CloseChart from "./CloseChart";
import { useEffect, useState } from "react";

function PlatformWiseSentimentStackedBarChart() {
  const { data, isLoading, isError, error } =
    useGetPlatformviseSentimentBarChart();

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

  const positiveSentiments = data?.positive ?? [];
  const negativeSentiments = data?.negative ?? [];
  const neutralSentiments = data?.neutral ?? [];

  const series = [
    {
      name: "Negative",
      data: negativeSentiments,
    },
    {
      name: "Neutral",
      data: neutralSentiments,
    },
    {
      name: "Positive",
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
    <div className="flex flex-col bg-white rounded-md overflow-hidden dark:text-dark-text dark:bg-dark-bg">
      <CloseChart chartName="PlatformWiseSentimentStackedBarChart" />
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

export default PlatformWiseSentimentStackedBarChart;
