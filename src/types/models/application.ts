import { Document, Types } from "mongoose";

export type InterviewStatus = "PENDING" | "IN-COMPLETED" | "COMPLETED";

export type HiringStatus = "PENDING" | "HIRED" | "REJECTED";

export interface ApplicationType extends Document {
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  interviewstatus: InterviewStatus;
  hiringStatus: HiringStatus;
  feedback: string;
  overallScore: number;
  communication: "FLUENT" | "GOOD" | "AVERAGE" | "POOR";
} 