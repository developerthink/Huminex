import { z } from "zod";

export const notificationSchema = z.object({
  title: z.string({
    required_error: "Notification title is required",
    invalid_type_error: "Notification title must be a string"
  }).min(2, "Notification title must be at least 2 characters"),

  email: z.string({
    invalid_type_error: "Email must be a string"
  }).email("Invalid email format").optional(),

  content: z.string({
    required_error: "Notification content is required",
    invalid_type_error: "Notification content must be a string"
  }).min(5, "Notification content must be at least 5 characters"),

  receiver_id: z.string({
    required_error: "Receiver ID is required",
    invalid_type_error: "Receiver ID must be a string"
  })
});

export type NotificationInput = z.infer<typeof notificationSchema>;
