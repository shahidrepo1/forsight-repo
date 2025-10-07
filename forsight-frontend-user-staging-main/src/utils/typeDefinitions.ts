import { z } from "zod";

export const PlatformSchema = z.union([
  z.literal("web"),
  z.literal("facebook"),
  z.literal("youtube"),
  z.literal("x"),
]);

export type PlatformType = z.infer<typeof PlatformSchema>;

export enum ViewType {
  grid = "grid",
  list = "list",
}

export type HomePageSectionsType = "charts" | "keywordCloud" | "data";

export type ConfiguratorSectionsType = "profile" | "keyword";

export const PaginationDetailSchema = z.object({
  count: z.number(),
  next: z.number().nullable(),
  previous: z.number().nullable(),
  page_size: z.number(),
  current_page: z.number(),
  total_pages: z.number(),
});

export type PaginationDetailType = z.infer<typeof PaginationDetailSchema>;

export const SentimentSchema = z.union([
  z.literal("negative"),
  z.literal("neutral"),
  z.literal("positive"),
]);

export type SentimentType = z.infer<typeof SentimentSchema>;
