import { z } from "zod";

export const PlaylistProfileSchema = z.object({
  targetProfileDbId: z.number(),
  platform: z.string(),
  profileUrl: z.string().url(),
  status: z.boolean(),
  dataCount: z.number(),
});

export type PlaylistProfileType = z.infer<typeof PlaylistProfileSchema>;

export const playListKeywordsSchema = z.object({
  targetKeywordDbId: z.number(),
  platforms: z.array(
    z.object({
      platform: z.string(),
      status: z.boolean(),
      enabled: z.boolean(),
    })
  ),
  dataCount: z.number(),
  keyword: z.array(z.string()),
  xDataCount: z.number(),
  youtubeDataCount: z.number(),
  facebookDataCount: z.number(),
  webDataCount: z.number(),
});

export type playListKeywordsType = z.infer<typeof playListKeywordsSchema>;

export const SinglePlaylistSchema = z.object({
  id: z.number(),
  keywords: z.array(playListKeywordsSchema),
  profiles: z.array(PlaylistProfileSchema),
  name: z.string(),
});

export type SinglePlaylistType = z.infer<typeof SinglePlaylistSchema>;

export const PlayListSchema = z.array(SinglePlaylistSchema);

export type PlayListType = z.infer<typeof PlayListSchema>;
