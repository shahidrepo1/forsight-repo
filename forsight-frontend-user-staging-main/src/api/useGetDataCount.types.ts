import { z } from "zod";

export const DataCountApiResponseSchema = z.object({
  totalCount: z.number(),
});

export type DataCountApiResponseType = z.infer<
  typeof DataCountApiResponseSchema
>;
