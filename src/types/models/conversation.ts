import { Document, Types } from "mongoose";

export interface ConversationType extends Document {
  appId: Types.ObjectId;
  interviewerResponse: string;
  candidateResponse: string;
}
