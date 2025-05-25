import type { UserType } from "./user";

export interface CandidateType extends UserType {
  skill: string[];
  state: string;
  educationDetails: [
    {
      collegeName: string;
      yearOfGraduation: number;
      fieldOfStudy: string;
      degree: string;
    }
  ],
  experience: [
    {
      companyName: string;
      companyWebsite: string;
      jobTitle: string;
      location: string;
      startDate: Date;
      endDate: Date;
      description: string;
      technologies: string[];
      isCurrent: boolean;
    }
  ],
  projects: [
    {
      title: string;
      link: string;
      description: string;
      technologies: string[];
    }
  ],
  socialLinks: {
    linkedin: string;
    github: string;
    x: string;
    portfolio: string;
  },
  summary: string;
  tagline: string;
} 