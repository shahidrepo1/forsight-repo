import { z } from "zod";

export const SingleWordRecordSchema = z.object({
  word: z.string(),
  score: z.number(),
  count: z.number(),
  percentile: z.number(),
});

export type SingleWordRecordType = z.infer<typeof SingleWordRecordSchema>;

export const WordcloudApiResponseSchema = z.array(SingleWordRecordSchema);

export type WordcloudApiResponseType = z.infer<
  typeof WordcloudApiResponseSchema
>;
