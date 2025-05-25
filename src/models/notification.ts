import mongoose, { Schema, Model } from "mongoose";
import type { NotificationType } from "../types/models/notification";

const notificationSchema = new Schema<NotificationType>(
  {
    title: {
      type: String,
      required: [true, "Please provide a notification title"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email',
      ],
    },
    content: {
      type: String,
      required: [true, "Please provide notification content"],
      trim: true,
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification must be associated with a sender"],
    },
    receiver_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification must be associated with a receiver"],
    },
  },
  {
    timestamps: true,
  }
);

const Notification =
  (mongoose.models.Notification as Model<NotificationType>) ||
  mongoose.model<NotificationType>("Notification", notificationSchema);

export default Notification;
