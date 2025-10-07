import { useInfiniteQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getLogsListUrl } from "./apiConstants";
import type { LogsApiResponseType } from "./useGetLogsList.types";

type GetLogsProps = {
  startDate: string | null;
  endDate: string | null;
};

export default function useGetLogsList({ startDate, endDate }: GetLogsProps) {
  const axiosPrivate = useAxiosPrivate();
  return useInfiniteQuery({
    queryKey: ["get-logs", startDate, endDate],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 0, signal }) => {
      const response = await axiosPrivate.get<LogsApiResponseType>(
        getLogsListUrl,
        {
          params: { startDate, endDate, page: pageParam },
          signal,
        }
      );

      //   return CrawlJobArraySchema.parse(response.data);

      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination.current_page;
      const totalPages = lastPage.pagination.total_pages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
}
