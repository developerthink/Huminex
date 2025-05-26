import mongoose, { Schema, Model } from "mongoose";
import type { ApplicationType } from "../types/models/application";

const ApplicationSchema = new Schema<ApplicationType>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Application must be associated with a job"],
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Application must be associated with a candidate"],
    },
    interviewstatus: {
      type: String,
      enum: ["IN-COMPLETED", "COMPLETED"],
      default: "IN-COMPLETED",
      required: [true, "Application status is required"],
    },
    hiringStatus: {
      type: String,
      enum: ["PENDING", "HIRED", "REJECTED"],
      default: "PENDING",
      required: [true, "Application status is required"],
    },
    feedback: { type: String },
    overallScore: {
      type: Number,
      default: 0,
    },
    communication: {
      type: String,
      enum: ["FLUENT", "GOOD", "AVERAGE", "POOR"],
      default: "AVERAGE",
    },
  },
  {
    timestamps: true,
  }
);

ApplicationSchema.index({ jobId: 1, candidateId: 1 });

const Application =
  (mongoose.models.Application as Model<ApplicationType>) ||
  mongoose.model<ApplicationType>("Application", ApplicationSchema);

export default Application; 