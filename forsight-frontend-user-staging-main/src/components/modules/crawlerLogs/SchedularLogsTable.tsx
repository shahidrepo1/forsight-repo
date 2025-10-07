import axios from "axios";
import useGetSchedularLogs from "../../../api/useGetSchedularLogs";

const SchedularLogsTable = () => {
  const { data, isPending, isError, error } = useGetSchedularLogs();

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
    <div className="max-h-[600px] overflow-y-auto scrollbar-thumb-aquagreen-400 scrollbar-thin scrollbar-track-gray-200">
      <table className="min-w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 shadow-sm rounded-md">
        <thead className="bg-gray-100 dark:bg-gray-800 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
          <tr>
            <th className="px-4 py-2">Platform</th>
            <th className="px-4 py-2">Profiles Count</th>
            <th className="px-4 py-2">Started At</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700 dark:text-gray-200">
          {data?.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
              >
                No data available.
              </td>
            </tr>
          ) : (
            data?.map((item, index) => (
              <tr
                key={index}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-2">{item.platform}</td>
                <td className="px-4 py-2">{item.profile_count}</td>
                <td className="px-4 py-2">{item.started_at}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === "completed"
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : item.status === "failed"
                          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                          : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SchedularLogsTable;
