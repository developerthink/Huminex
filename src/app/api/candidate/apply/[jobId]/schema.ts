import { z } from "zod";

export const jobApplicationSchema = z.object({
  jobId: z.string({
    required_error: "Job ID is required",
    invalid_type_error: "Job ID must be a string"
  })
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>; 