import { z } from "zod";

export const conversationSchema = z.object({
  jobId: z.string({
    required_error: "Job ID is required",
    invalid_type_error: "Job ID must be a string"
  }),
  interviewer: z.string({
    required_error: "Interviewer is required",
    invalid_type_error: "Interviewer must be a string"
  }),
  candidate: z.string({
    required_error: "Candidate is required",
    invalid_type_error: "Candidate must be a string"
  }),
  analysis: z.object({
    status: z.enum(['question-answered', 'question-skipped', 'question-not-answered'], {
      required_error: "Analysis status is required",
      invalid_type_error: "Analysis status must be a valid status"
    }),
    accuracy: z.number({
      required_error: "Accuracy is required",
      invalid_type_error: "Accuracy must be a number"
    }),
    confidence: z.number({
      required_error: "Confidence is required",
      invalid_type_error: "Confidence must be a number"
    }),
    difficulty: z.enum(['easy', 'medium', 'hard'], {
      required_error: "Difficulty is required",
      invalid_type_error: "Difficulty must be a valid difficulty"
    }),
  })
});

export type ConversationInput = z.infer<typeof conversationSchema>; 