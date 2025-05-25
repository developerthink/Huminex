import { z } from "zod";

export const companyDetailsSchema = z.object({
  companyDetails: z.object({
    name: z
      .string({
        required_error: "Company name is required",
      })
      .min(2, "Company name must be at least 2 characters"),

    about: z
      .string({
        required_error: "Company is required",
      })
      .min(10, "Company must be at least 10 characters"),

    website: z
      .string()
      .url("Invalid website URL")
      .optional(),

    linkedin: z
      .string()
      .url("Invalid LinkedIn URL")
      .optional(),

    x: z
      .string()
      .url("Invalid X URL")
      .optional(),

    logo: z
      .string({
        required_error: "Logo URL is required",
      }),

    numberOfEmployees: z
      .number({
        required_error: "Number of employees is required",
        invalid_type_error: "Number of employees must be a number",
      })
      .positive("Number of employees must be a positive number"),

    companyType: z
      .string({
        required_error: "Company type is required",
      })
      .min(2, "Company type must be at least 2 characters"),

    industryType: z
      .string({
        required_error: "Industry type is required",
      })
      .min(2, "Industry type must be at least 2 characters"),

    tagline: z
      .string({
        required_error: "Tagline is required",
      })
      .min(5, "Tagline must be at least 5 characters")
      .max(150, "Tagline must not exceed 150 characters"),

    location: z
      .string({
        required_error: "Location is required",
      })
      .min(2, "Location must be at least 2 characters"),
  }),
});

export type CompanyDetailsInput = z.infer<typeof companyDetailsSchema>;
