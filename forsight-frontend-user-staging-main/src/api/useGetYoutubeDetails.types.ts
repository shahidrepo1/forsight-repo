import { z } from "zod";

// Define the schema for the targetYouTubeProfile object
const targetYouTubeProfileSchema = z.object({
  targetYoutubeProfileId: z.number(),
  channelSubscribersCount: z.string(),
  channelVideoCount: z.string(),
  channelViewCount: z.string(),
  channelName: z.string(),
  channelDescription: z.string(),
  channelUrl: z.string(),
  channelPublishedAt: z.string(),
  channelCountry: z.string(),
});

// Define the schema for the main object
export const youtubeVideoSchema = z.object({
  id: z.number(),
  ytRecordDbId: z.number(),
  uniqueIdentifier: z.string(),
  media: z.string().nullable(),
  thumbnail: z.string().nullable(),
  platform: z.union([
    z.literal("web"),
    z.literal("facebook"),
    z.literal("youtube"),
    z.literal("x"),
  ]),
  videoViewCount: z.string(),
  videoTitle: z.string(),
  videoDuration: z.number(),
  originalVideoUrl: z.string(),
  originalVideoTumbnailUrl: z.string(),
  videoPublishedAt: z.string(),
  videoSentiment: z.enum(["positive", "negative", "neutral"]),
  targetYoutubeProfile: targetYouTubeProfileSchema,
});

// Inferred TypeScript type from the schema
export type YouTubeVideoDetail = z.infer<typeof youtubeVideoSchema>;
