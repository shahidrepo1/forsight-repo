import { z } from "zod";

export const SentimentDonutChartDataApiResponseSchema = z
  .object({
    positive: z.number(),
    negative: z.number(),
    neutral: z.number(),
  })
  .strict();

export type SentimentDonutChartDataApiResponseType = z.infer<
  typeof SentimentDonutChartDataApiResponseSchema
>;
