import { z } from "zod";

const experienceSchema = z.object({
  companyName: z.union([z.string(), z.null()]).optional(),
  companyWebsite: z.union([z.string(), z.null()]).optional(),
  jobType: z.union([z.string(), z.null()]).optional(), // Free-form string, no enum
  jobTitle: z.union([z.string(), z.null()]).optional(),
  startDate: z.union([z.date(), z.null()]).optional(), // Allow null for dates
  endDate: z.union([z.date(), z.null()]).optional(), // Allow null for dates
  description: z.union([z.string(), z.null()]).optional(),
  location: z.union([z.string(), z.null()]).optional(),
  technologies: z.union([z.array(z.string()), z.null()]).optional(),
  isCurrent: z.union([z.boolean(), z.null()]).optional(),
});

const projectSchema = z.object({
  title: z.union([z.string(), z.null()]).optional(),
  link: z.union([z.string(), z.null()]).optional(),
  description: z.union([z.string(), z.null()]).optional(),
  technologies: z.union([z.array(z.string()), z.null()]).optional(),
});

const socialLinksSchema = z.object({
  linkedin: z.union([z.string(), z.null()]).optional(),
  github: z.union([z.string(), z.null()]).optional(),
  x: z.union([z.string(), z.null()]).optional(),
  portfolio: z.union([z.string(), z.null()]).optional(),
});

const educationDetailsSchema = z.object({
  collegeName: z.union([z.string(), z.null()]).optional(),
  yearOfGraduation: z.union([z.number(), z.null()]).optional(), // Explicitly allow null
  fieldOfStudy: z.union([z.string(), z.null()]).optional(),
  degree: z.union([z.string(), z.null()]).optional(),
});

export const candidateProfileSchema = z.object({
  skill: z.union([z.array(z.string()), z.null()]).optional(),
  state: z.union([z.string(), z.null()]).optional(),
  educationDetails: z.union([z.array(educationDetailsSchema), z.null()]).optional(),
  experience: z.union([z.array(experienceSchema), z.null()]).optional(),
  projects: z.union([z.array(projectSchema), z.null()]).optional(),
  socialLinks: z.union([socialLinksSchema, z.null()]).optional(),
  image: z.union([z.string(), z.null()]).optional(),
  summary: z.union([z.string(), z.null()]).optional(),
  tagline: z.union([z.string(), z.null()]).optional(),
});

export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;