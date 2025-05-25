import { Document } from "mongoose";

export interface WaitlistType extends Document {
  email: string;
  createdAt: Date;
  updatedAt: Date;
} 