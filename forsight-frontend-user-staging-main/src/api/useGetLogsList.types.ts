import { z } from "zod";
import { PaginationDetailSchema } from "../utils/typeDefinitions";

const CrawlJobSchema = z.object({
  id: z.number(),
  profileName: z.string(),
  profilePlatform: z.string(),
  startedAt: z.string().datetime(), // ISO 8601 string
  status: z.string(),
  processDuration: z.string(),
  finishedAt: z.string().datetime(),
  recordsCrawled: z.number(),
  errorMessage: z.string().nullable(),
});

export const CrawlJobArraySchema = z.array(CrawlJobSchema);

export type CrawlJobArray = z.infer<typeof CrawlJobArraySchema>;

export const LogsApiResponseSchema = z
  .object({
    data: z.array(CrawlJobSchema),
    pagination: PaginationDetailSchema,
  })
  .strict();

export type LogsApiResponseType = z.infer<typeof LogsApiResponseSchema>;
