import { z } from "zod";

export const DistributionDataApiResponseSchema = z.object({
  x: z.number(),
  facebook: z.number(),
  youtube: z.number(),
  web: z.number(),
});

export type DistributionDataApiResponseType = z.infer<
  typeof DistributionDataApiResponseSchema
>;
