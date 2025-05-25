import mongoose, { Schema, Model } from "mongoose";
import type { ConversationType } from "../types/models/conversation";

const ConversationSchema = new Schema<ConversationType>(
  {
    appId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: [true, "Interview must be associated with an application"],
    },
    currentQuestion: {
      type: String,
      required: [true, "Current question is required"],
    },
    previousUserResponseAnalysis:{
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ jobId: 1, candidateId: 1 });

const Conversation =
  (mongoose.models.Conversation as Model<ConversationType>) ||
  mongoose.model<ConversationType>("Conversation", ConversationSchema);

export default Conversation;
