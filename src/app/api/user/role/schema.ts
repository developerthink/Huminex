import { z } from "zod";

export const roleUpdateSchema = z.object({
  role: z.enum(["candidate", "employer"], {
    required_error: "Role is required",
    invalid_type_error: "Role must be either candidate or employer"
  })
});

export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>; 