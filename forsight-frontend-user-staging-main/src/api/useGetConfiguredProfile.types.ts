import { z } from "zod";
import { PlatformSchema } from "../utils/typeDefinitions";

export const SingleProfileRecordSchema = z
  .object({
    targetProfileDbId: z.number(),
    platform: PlatformSchema,
    profileUrl: z.string().url(),
    status: z.boolean(),
    dataCount: z.number().int(),
  })
  .strict();

export type SingleProfileRecordType = z.infer<typeof SingleProfileRecordSchema>;

export const GetProfilesApiResponseSchema = z.object({
  // TODO: this object is unnecessary, we can just return the array. fix it later from backend
  profiles: z.array(SingleProfileRecordSchema),
});

export type GetProfilesApiResponseType = z.infer<
  typeof GetProfilesApiResponseSchema
>;
