import { z } from "zod";

const SchedularLogs = z.object({
  platform: z.string(),
  profile_count: z.number(),
  started_at: z.string(),
  status: z.enum(["completed", "pending", "failed"]),
});

export const SchedularLogsArraySchema = z.array(SchedularLogs);

export type Item = z.infer<typeof SchedularLogs>;
export type SchedularLogsArray = z.infer<typeof SchedularLogsArraySchema>;
