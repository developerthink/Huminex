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
}: {
  title: string;
  email?: string;
  content: string;
  receiver_id: string;
}) {
  const session = await auth();

  if (!session) {
    return {
      error: "Unauthorized",
      data: null,
    };
  }

  try {
    await connectDB();

    // Create notification with sender ID from session
    const notification = await Notification.create({
      title,
      email,
      content,
      receiver_id,
      sender_id: session.user.id,
    });

    // Populate sender details in response
    const populatedNotification = await notification.populate(
      "sender_id",
      "name email image"
    );
    const serializedNotification = JSON.parse(
      JSON.stringify(populatedNotification)
    );
    // Optional: Revalidate cache for paths that display notifications
    revalidatePath("/notifications");
    console.log("Notification created:", serializedNotification, title);

    return {
      error: null,  
      data: serializedNotification,
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return {
      error: "Internal server error",
      data: null,
    };
  }
}
