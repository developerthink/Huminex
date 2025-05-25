import { Document, Types } from 'mongoose';

export interface NotificationType extends Document {
  title: string;
  email?: string;
  content: string;
  sender_id: Types.ObjectId;
  receiver_id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
