import { z } from "zod";
import { PlatformSchema } from "../utils/typeDefinitions";

export const PlatformviseSentimentApiResponseSchema = z.object({
  platforms: PlatformSchema.array(),
  positive: z.array(z.number()),
  negative: z.array(z.number()),
  neutral: z.array(z.number()),
});

export type PlatformviseSentimentApiResponseType = z.infer<
  typeof PlatformviseSentimentApiResponseSchema
>;
