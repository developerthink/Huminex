import mongoose, { Schema, Model } from "mongoose";
import type { JobType } from "../types/models/job";

const BASE_DURATION = 5; // default 5 mins for first tier
const BASE_PRICE_PER_MINUTE = 0.5; // $0.5 per minute for first 5 minutes
const ADDITIONAL_PRICE_PER_MINUTE = 0.8; // $0.8 per minute after 5 minutes

const jobSchema = new Schema<JobType>(
  {
    title: {
      type: String,
      required: [true, "Please provide a job title"],
      trim: true,
    },
    about: {
      type: String,
      required: [true, "Please provide job details"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Please provide job location"],
      trim: true,
    },
    workType: {
      type: String,
      enum: ["remote", "on-site", "hybrid"],
      default: "remote",
    },
    salaryRange : {
     start : {
      type : Number,
      required : [true, "Please provide salary range start"]
     },
     end : {
      type : Number,
      required : [true, "Please provide salary range end"]
     }
    },
    jobType: {
      type: String,
      default: "full-time",
      enum: {
        values: ["full-time", "part-time", "internship"],
        message: "Job type must be full-time, part-time, or internship",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    workExperience: {
      type: Number,
      required: [true, "Please specify required work experience in years"],
      min: [0, "Work experience cannot be negative"],
    },
    techStack: [
      {
        type: String,
        required: [true, "Please provide at least one technology"],
        trim: true,
      },
    ],
    interviewSettings: {
      maxCandidates: {
        type: Number,
        required: [true, "Please specify the maximum number of candidates"],
        enum: {
          values: [1, 2],
          message: "Maximum candidates must be either 1 or 2",
        },
      },
      interviewDuration: {
        type: Number,
        required: [true, "Please specify the interview duration"],
        enum: {
          values: [10, 15, 20, 25, 30],
          message: "Interview duration must be 10, 15, 20, 25, or 30 minutes",
        },
      },
      interviewers: [
        {
          name: {
            type: String,
            required: [true, "Please provide interviewer name"],
          },
          gender: {
            type: String,
            enum: ["male", "female"],
            required: [true, "Please provide interviewer gender"],
          },
          qualification: {
            type: String,
            required: [true, "Please provide interviewer qualification"],
          },
        },
      ],
      difficultyLevel: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: [true, "Please specify the difficulty level"],
      },
      language: {
        type: String,
        enum: ["english", "hindi"],
        default: "english",
      },
      questions: [
        {
          text: { type: String, required: true },
          type: {
            type: String,
            enum: ["TECHNICAL", "BEHAVIORAL", "SITUATIONAL"],
            required: true,
          },
        },
      ],
    },
    price: {
      type: Number,
      required: true,
    },
    employerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Job must be associated with an employer"],
    },
    paymentDetails: {
      status: {
        type: String,
        enum: {
          values: ["pending", "completed", "failed"],
          message:
            "Payment status must be either pending, completed, or failed",
        },
        default: "pending",
        required: true,
      },
      transactionId: {
        type: String,
        sparse: true,
      },
      paidAt: {
        type: Date,
      },
    },
    invitedCandidates: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add a pre-save hook to calculate price based on tiered pricing
jobSchema.pre("save", function (next) {
  if (this.isModified("interviewSettings.interviewDuration")) {
    // Calculate base price for first 5 minutes
    const basePriceTotal = BASE_DURATION * BASE_PRICE_PER_MINUTE;

    // Calculate additional price for minutes beyond 5
    const additionalMinutes =
      this.interviewSettings.interviewDuration - BASE_DURATION;
    const additionalPriceTotal =
      additionalMinutes * ADDITIONAL_PRICE_PER_MINUTE;

    // Total price is sum of base price and additional price, rounded up to nearest dollar
    this.price = Math.ceil(basePriceTotal + additionalPriceTotal);
  }
  next();
});

const Job =
  (mongoose.models.Job as Model<JobType>) ||
  mongoose.model<JobType>("Job", jobSchema);

export default Job;
