"use server";

import { auth } from "@/auth";
import connectDB from "@/config/db";
import Notification from "@/models/notification";
import { revalidatePath } from "next/cache";

export async function createNotificationAction({
  title,
  email,
  content,
  receiver_id,
  sender_id
}: {
  title: string;
  email?: string;
  content: string;
  receiver_id: string;
  sender_id?: string;
}) {
  const session = await auth();
  try {
    // Ensure database connection
    await connectDB();
    console.log("Creating notification:", { title, receiver_id, sender_id });

    let notification;

    if (sender_id) {
      // Direct notification with sender_id provided
      notification = await Notification.create({
        title,
        email,
        content,
        receiver_id,
        sender_id,
      });
    } else {
      // Check authentication for user-initiated notifications
      if (!session?.user?.id) {
        console.error("Unauthorized notification attempt");
        return {
          error: "Unauthorized",
          data: null,
        };
      }
      
      notification = await Notification.create({
        title,
        email,
        content,
        receiver_id,
        sender_id: session.user.id,
      });
    }

    console.log("Notification created successfully:", notification._id);

    // Try to populate sender details, but handle if sender doesn't exist
    let populatedNotification;
    try {
      populatedNotification = await notification.populate(
        "sender_id",
        "name email image"
      );
    } catch (populateError) {
      console.warn("Could not populate sender details:", populateError);
      populatedNotification = notification;
    }

    const serializedNotification = JSON.parse(
      JSON.stringify(populatedNotification)
    );

    // Revalidate cache for notification paths
    try {
      revalidatePath("/notifications");
    } catch (revalidateError) {
      console.warn("Could not revalidate path:", revalidateError);
    }

    console.log("Notification process completed successfully");
    return {
      error: null,
      data: serializedNotification,
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return {
      error: error instanceof Error ? error.message : "Internal server error",
      data: null,
    };
  }
}
