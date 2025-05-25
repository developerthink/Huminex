import { z } from "zod";

export const jobSchema = z.object({
  title: z.string({
    required_error: "Job title is required",
    invalid_type_error: "Job title must be a string"
  }).min(2, "Job title must be at least 2 characters"),

  about: z.string({
    required_error: "Job details are required",
    invalid_type_error: "Job details must be a string"
  }).min(10, "Job details must be at least 10 characters"),

  location: z.string({
    required_error: "Location is required",
    invalid_type_error: "Location must be a string"
  }),

  salaryRange: z.object({
    start: z.number({
      required_error: "Starting CTC is required",
      invalid_type_error: "Starting CTC must be a number"
    }).positive("Starting CTC must be positive"),
    end: z.number({
      required_error: "Ending CTC is required",
      invalid_type_error: "Ending CTC must be a number"
    }).positive("Ending CTC must be positive")
  }),

  jobType: z.enum(["full-time", "part-time", "internship"], {
    required_error: "Job type is required",
    invalid_type_error: "Job type must be either full-time, part-time, or internship"
  }),

  language: z.enum(["english", "hindi"], {
    required_error: "Language is required",
    invalid_type_error: "Language must be either english or hindi"
  }).optional(),

  workType: z.enum(["remote", "on-site", "hybrid"], {
    invalid_type_error: "Work type must be either remote, on-site, or hybrid"
  }).optional(),

  workExperience: z.number({
    required_error: "Work experience is required",
    invalid_type_error: "Work experience must be a number"
  }).min(0, "Work experience cannot be negative"),

  techStack: z.array(z.string()).min(1, "At least one technology is required"),

  invitedCandidates: z.array(z.object({
    name: z.string({
      required_error: "Candidate name is required",
      invalid_type_error: "Candidate name must be a string"
    }),
    email: z.string({
      invalid_type_error: "Email must be a string"
    }).email("Invalid email format")
  })).optional(),

  interviewSettings: z.object({
    maxCandidates: z.number({
      required_error: "Maximum candidates is required",
      invalid_type_error: "Maximum candidates must be a number"
    }).refine(val => [1, 2].includes(val), {
      message: "Maximum candidates must be either 1 or 2"
    }),

    interviewDuration: z.number({
      required_error: "Interview duration is required",
      invalid_type_error: "Interview duration must be a number"
    }).refine(val => [10, 15, 20, 25, 30].includes(val), {
      message: "Interview duration must be 10, 15, 20, 25, or 30 minutes"
    }),

    interviewers: z.array(z.object({
      name: z.string({
        required_error: "Interviewer name is required",
        invalid_type_error: "Interviewer name must be a string"
      }),
      gender: z.enum(["male", "female"], {
        required_error: "Interviewer gender is required",
        invalid_type_error: "Gender must be either male or female"
      }),
      qualification: z.string({
        required_error: "Interviewer qualification is required",
        invalid_type_error: "Qualification must be a string"
      })
    })).min(1, "At least one interviewer is required"),

    difficultyLevel: z.enum(["easy", "medium", "hard"], {
      required_error: "Difficulty level is required",
      invalid_type_error: "Difficulty level must be easy, medium, or hard"
    }),

    questions: z.array(z.object({
      text: z.string({
        required_error: "Question text is required",
        invalid_type_error: "Question text must be a string"
      }).min(10, "Question must be at least 10 characters"),
      type: z.enum(["TECHNICAL", "BEHAVIORAL", "SITUATIONAL"], {
        required_error: "Question type is required",
        invalid_type_error: "Question type must be either TECHNICAL, BEHAVIORAL, or SITUATIONAL"
      })
    })).min(1, "At least one question is required")
  }),

});

export type JobInput = z.infer<typeof jobSchema>; 