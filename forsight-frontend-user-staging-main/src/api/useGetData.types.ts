import { z } from "zod";
import {
  PaginationDetailSchema,
  SentimentSchema,
} from "../utils/typeDefinitions";

export const SingleWebRecordSchema = z.object({
  platform: z.literal("web"),
  targetWebProfile: z.object({
    targetWebProfileId: z.number(),
    platformName: z.string(),
  }),
  webRecordDbId: z.number(),
  uniqueIdentifier: z.string(),
  articleTitle: z.string(),
  articleDescription: z.string(),
  originalThumbnail: z.string().url(),
  articlePublishedAt: z.string().datetime(), // Ensures ISO 8601 datetime format
  originalArticleUrl: z.string().url(),
  articleSentiment: z.union([
    z.literal("positive"),
    z.literal("negative"),
    z.literal("neutral"),
  ]), // Constrain sentiment values
  thumbnail: z.string(),
});

export type SingleWebRecordType = z.infer<typeof SingleWebRecordSchema>;

export const SingleTweetRecordSchema = z
  .object({
    platform: z.literal("x"),
    // id is same as tweetDbId. we keep it so we can use it with single key where working with mutli-platform data
    id: z.number(),
    tweetDbId: z.number(),
    uniqueIdentifier: z.string(),
    targetXProfile: z.object({
      targetProfileDbId: z.number(),
      targetProfileScreenName: z.string(),
      targetProfileFollowersCount: z.string().nullable(),
    }),
    tweetText: z.string().nullable(),
    // TODO: this is a non-nullable field
    tweetViews: z.number().nullable(),
    tweetReplies: z.string().nullable(),
    tweetFavoriteCount: z.string().nullable(),
    retweetCount: z.string().nullable(),
    tweetBookmarkCount: z.string().nullable(),
    tweetCreatedAt: z.string().datetime({ offset: true }),
    tweetImageLink: z.string().nullable(),
    tweetOriginalLink: z.string().nullable(),
    tweetSentiment: SentimentSchema,
    tweetVideoLink: z.string().nullable(),
  })
  .strict();

export type SingleTweetRecordType = z.infer<typeof SingleTweetRecordSchema>;

export const SingleYoutubeProfileSchema = z.object({
  targetYoutubeProfileId: z.number(),
  channelName: z.string(),
  channelSubscribersCount: z.string(),
  channelDescription: z.string(),
  channelUrl: z.string(),
  channelVideoCount: z.string(),
  channelViewCount: z.string(),
  channelPublishedAt: z.string().datetime({ offset: true }),
  channelCountry: z.string(),
});

export type SingleYoutubeProfileType = z.infer<
  typeof SingleYoutubeProfileSchema
>;

export const SingleYoutubeRecordSchema = z.object({
  platform: z.literal("youtube"),
  // id is same as ytRecordDbId. we keep it so we can use it with single key where working with mutli-platform data
  id: z.number(),
  ytRecordDbId: z.number(),
  uniqueIdentifier: z.string(),
  targetYoutubeProfile: SingleYoutubeProfileSchema,
  media: z.string().nullable(),
  thumbnail: z.string().nullable(),
  videoTitle: z.string(),
  videoDuration: z.number(),
  videoViewCount: z.string().nullable(),
  originalVideoUrl: z.string().url(),
  originalVideoTumbnailUrl: z.string().url().nullable(),
  videoPublishedAt: z.string().datetime({ offset: true }),
  videoSentiment: SentimentSchema,
});

export type SingleYoutubeRecordType = z.infer<typeof SingleYoutubeRecordSchema>;

export const SingleWebProfileRecordSchema = z.object({
  targetWebProfileId: z.number(),
  platformName: z.string(),
});

export type SingleWebProfileRecordType = z.infer<
  typeof SingleWebProfileRecordSchema
>;

export const DataUnionSchema = z.discriminatedUnion("platform", [
  SingleTweetRecordSchema,
  SingleYoutubeRecordSchema,
  SingleWebRecordSchema,
]);

export type DataUnionType = z.infer<typeof DataUnionSchema>;

export const DataApiResponseSchema = z
  .object({
    data: z.array(DataUnionSchema),
    pagination: PaginationDetailSchema,
  })
  .strict();

export type DataApiResponseType = z.infer<typeof DataApiResponseSchema>;
