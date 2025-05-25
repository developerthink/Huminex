import mongoose, { Schema, Model } from "mongoose";
import type { WaitlistType } from "../types/models/waitlist";

const WaitlistSchema = new Schema<WaitlistType>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      trim: true,
      lowercase: true,
    }
  },
  {
    timestamps: true,
  }
);

const Waitlist =
  (mongoose.models.Waitlist as Model<WaitlistType>) ||
  mongoose.model<WaitlistType>("Waitlist", WaitlistSchema);

export default Waitlist; 