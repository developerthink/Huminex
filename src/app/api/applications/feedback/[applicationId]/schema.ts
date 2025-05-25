import { z } from "zod";

export const applicationFeedbackSchema = z.object({
  feedback: z.string({
    required_error: "Feedback is required",
    invalid_type_error: "Feedback must be a string"
  }),
});

export type ApplicationFeedbackInput = z.infer<typeof applicationFeedbackSchema>;