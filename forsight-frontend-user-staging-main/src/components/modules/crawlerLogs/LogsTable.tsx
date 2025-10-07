import axios from "axios";
import useGetLogsList from "../../../api/useGetLogsList";
import { useEffect } from "react";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { toast } from "react-toastify";

type LogsTypes = {
  startDate: string | null;
  endDate: string | null;
};

const LogsTable = ({ startDate, endDate }: LogsTypes) => {
  const [ref, entry] = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "0px",
    root: null,
  });
  const {
    data,
    isPending,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetLogsList({
    startDate,
    endDate,
  });
  const flatMapData = data?.pages.flatMap((page) => page.data) ?? [];

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage().catch(() => {
        toast.error("Failed to fetch more logs");
      });
    }
  }, [entry, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isPending) {
    return <p className="animate-pulse">Loading...</p>;
  }
  if (
    axios.isAxiosError<{
      message: string;
    }>(error)
  )
    if (isError) {
      return axios.isAxiosError<{ message: string }>(error) ? (
        <p>{error.response?.data.message}</p>
      ) : (
        <p>{(error as Error).message}</p>
      );
    }
  return (
    <div>
      <table className="min-w-full bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-700 shadow-sm rounded-md">
        <thead className="bg-gray-100 dark:bg-dark-surface text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
          <tr>
            <th className="px-4 py-2">Profile Name</th>
            <th className="px-4 py-2">Platform</th>
            <th className="px-4 py-2">Started At</th>
            <th className="px-4 py-2">Finished At</th>
            <th className="px-4 py-2">Duration</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Records Crawled</th>
            <th className="px-4 py-2">Error Message</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700 dark:text-gray-200">
          {flatMapData.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
              >
                No data available.
              </td>
            </tr>
          ) : (
            flatMapData.map((item, index) => (
              <tr
                key={index}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark-surface"
              >
                <td className="px-4 py-2">{item.profileName}</td>
                <td className="px-4 py-2">{item.profilePlatform}</td>
                <td className="px-4 py-2">{item.startedAt}</td>
                <td className="px-4 py-2">{item.finishedAt}</td>
                <td className="px-4 py-2">{item.processDuration}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === "SUCCESS"
                        ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                        : item.status === "FAILED"
                          ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-2">{item.recordsCrawled}</td>
                <td className="px-4 py-2 text-red-500 dark:text-red-400 max-w-44 break-words">
                  {item.errorMessage}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="h-10 mt-10" ref={ref}>
        {hasNextPage && isFetchingNextPage && (
          <div className="flex items-center justify-center w-full">
            <div className="w-12">loading</div>
          </div>
        )}
        {!hasNextPage && flatMapData.length !== 0 && !isFetchingNextPage && (
          <p className="my-5 text-center">No more data.</p>
        )}
      </div>
    </div>
  );
};

export default LogsTable;
