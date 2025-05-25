import { Document, Types } from "mongoose";

export interface ConversationType extends Document {
  appId: Types.ObjectId;
  currentQuestion: string;
  previousUserResponseAnalysis: string;
}
