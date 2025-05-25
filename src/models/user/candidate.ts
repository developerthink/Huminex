import { Model, Schema } from "mongoose";
import User from "./user";
import type { CandidateType } from "../../types/models/user/candidate";

const candidateSchema = new Schema<CandidateType>({
  skill: { type: [String] },
  state: { type: String },
  educationDetails: [
    {
      collegeName: { type: String },
      yearOfGraduation: { type: Number },
      fieldOfStudy: { type: String },
      degree: { type: String },
    },
  ],
  experience: [
    {
      companyName: { type: String },
      companyWebsite: { type: String },
      jobType: {
        type: String,
      },
      jobTitle: { type: String },
      location: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      description: { type: String },
      technologies: [{ type: String }],
      isCurrent: { type: Boolean },
    },
  ],
  projects: [
    {
      title: { type: String },
      link: { type: String },
      description: { type: String },
      technologies: [{ type: String }],
    },
  ],
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    x: { type: String },
    portfolio: { type: String },
  },
  summary: { type: String },
  tagline: { type: String },
});

const Candidate = (User.discriminators?.['candidate'] ||
  User.discriminator<CandidateType>('candidate', candidateSchema)) as Model<CandidateType>;

export default Candidate;
