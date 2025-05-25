import { z } from "zod";

export const applicationStatusSchema = z.object({
  hiringStatus: z.enum(["PENDING", "HIRED", "REJECTED"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be a valid status"
  }),
});

export type ApplicationStatusInput = z.infer<typeof applicationStatusSchema>; 