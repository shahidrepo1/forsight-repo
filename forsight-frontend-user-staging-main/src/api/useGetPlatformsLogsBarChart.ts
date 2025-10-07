import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { platformWiseLogsChartChartUrl } from "./apiConstants";

const PlatformSchema = z.union([z.literal("x"), z.literal("youtube")]);

export const PlatformWiseLogsApiResponseSchema = z.object({
  platforms: PlatformSchema.array(),
  running: z.array(z.number()),
  success: z.array(z.number()),
  failed: z.array(z.number()),
});

export type PlatformViseLogsApiResponseType = z.infer<
  typeof PlatformWiseLogsApiResponseSchema
>;

export default function useGetPlatformsLogsBarChart({
  startDate,
  endDate,
}: {
  startDate: string | null;
  endDate: string | null;
}) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["platformWiseLogsBarChart", startDate, endDate],
    queryFn: async () => {
      const response = await axiosPrivate.get<PlatformViseLogsApiResponseType>(
        platformWiseLogsChartChartUrl,
        {
          params: {
            startDate,
            endDate,
          },
        }
      );
      return response.data;
    },
  });
}
