import { z } from "zod";

const targetXProfileSchema = z.object({
  targetProfileDbId: z.number(),
  targetProfileFastFollowersCount: z.string(),
  targetProfileFavouritesCount: z.string(),
  targetProfileFollowersCount: z.string(),
  targetProfileFriendsCount: z.string(),
  targetProfileMediaCount: z.string(),
  targetProfileNormalFollowersCount: z.string(),
  targetProfileStatusesCount: z.string(),
  targetProfileName: z.string(),
  targetProfileScreenName: z.string(),
  isBlueTickVerified: z.boolean(),
  defaultProfile: z.boolean(),
  targetProfileCreatedAt: z.string(),
  targetProfileDescription: z.string(),
  targetProfileDisplayUrl: z.string(),
  targetProfileLink: z.string().url(),
  targetProfileGeographicalLocation: z.string(),
});

export const tweetSchema = z.object({
  tweetDbId: z.number(),
  targetXProfile: targetXProfileSchema,
  platform: z.string(),
  tweetReplies: z.string(),
  tweetFavoriteCount: z.string(),
  retweetCount: z.string(),
  tweetBookmarkCount: z.string(),
  tweetVideoLink: z.string().nullable(),
  tweetImageLink: z.string(),
  tweetText: z.string(),
  tweetViews: z.number(),
  tweetCreatedAt: z.string(),
  tweetOriginalLink: z.string().url(),
  tweetSentiment: z.string(),
});

// Infer the types from the schema
export type TargetXProfile = z.infer<typeof targetXProfileSchema>;
export type Tweet = z.infer<typeof tweetSchema>;
