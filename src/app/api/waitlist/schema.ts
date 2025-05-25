import { z } from "zod";

export const waitlistSchema = z.object({
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string"
  }).email("Invalid email address")
});

export type WaitlistInput = z.infer<typeof waitlistSchema>; 