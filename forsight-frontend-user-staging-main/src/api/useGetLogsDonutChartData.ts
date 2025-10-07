import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { logsDonutChartUrl } from "./apiConstants";

import { z } from "zod";

export const LogsDonutChartDataApiResponseSchema = z
  .object({
    SUCCESS: z.number(),
    FAILED: z.number(),
    RUNNING: z.number(),
  })
  .strict();

export type LogsDonutChartDataApiResponseType = z.infer<
  typeof LogsDonutChartDataApiResponseSchema
>;

export default function useGetLogsDonutChartData({
  startDate,
  endDate,
}: {
  startDate: string | null;
  endDate: string | null;
}) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["logsDonutChartData", startDate, endDate],
    queryFn: async () => {
      const response =
        await axiosPrivate.get<LogsDonutChartDataApiResponseType>(
          logsDonutChartUrl,
          {
            params: { startDate, endDate },
          }
        );
      return response.data;
    },
  });
}
