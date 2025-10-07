import { z } from "zod";
import { PlatformSchema } from "../utils/typeDefinitions";

export const SinglePlatformRecordSchema = z.object({
  platform: PlatformSchema,
  enabled: z.boolean(),
  status: z.boolean(),
});

export type SinglePlatformRecordType = z.infer<
  typeof SinglePlatformRecordSchema
>;

export const SingleKeywordRecordSchema = z.object({
  targetKeywordDbId: z.number(),
  suspended: z.boolean(),
  platforms: SinglePlatformRecordSchema.array(),
  keyword: z.string(),
  counts: z.object({
    xDataCount: z.number(),
    youtubeDataCount: z.number(),
    facebookDataCount: z.number(),
    webDataCount: z.number(),
    totalDataCount: z.number(),
  }),
});

export type SingleKeywordRecordType = z.infer<typeof SingleKeywordRecordSchema>;

export const GetKeywordsApiResponseSchema = z.object({
  keywords: z.array(SingleKeywordRecordSchema),
});

export type GetKeywordsApiResponseType = z.infer<
  typeof GetKeywordsApiResponseSchema
>;
