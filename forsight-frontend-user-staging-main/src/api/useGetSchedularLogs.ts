import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getSchedularLogsListUrl } from "./apiConstants";

import type { SchedularLogsArray } from "./useGetSchedularLogs.types";

export default function useGetSchedularLogs() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["schedular-logs"],
    queryFn: async () => {
      const response = await axiosPrivate.get<SchedularLogsArray>(
        getSchedularLogsListUrl
      );
      //   return CrawlJobArraySchema.parse(response.data);

      return response.data;
    },
  });
}
