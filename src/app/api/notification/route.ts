import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/config/db";
import Notification from "@/models/notification";
import { auth } from "@/auth";
import { notificationSchema } from "./schema";
import { fromZodError } from "zod-validation-error";
import mongoose from "mongoose";

// Get all notifications for the logged-in user
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized", data: null },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    const userId = session.user.id;

    // Find all notifications where the logged-in user is the receiver
    const notifications = await Notification.find({ receiver_id: userId })
      .sort({ createdAt: -1 })
      .populate("sender_id");

    return NextResponse.json({
      error: null,
      data: notifications
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
}

// Create a new notification
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ 
      error: "Unauthorized",
      data: null 
    }, { status: 401 });
  }

  try {
    await connectDB();

    const body = await request.json();

    // Validate request body
    const validationResult = notificationSchema.safeParse(body);
    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return NextResponse.json(
        { error: validationError.message, data: null },
        { status: 400 }
      );
    }

    // Create notification with sender ID from session
    const notification = await Notification.create({
      ...validationResult.data,
      sender_id: session.user.id
    });

    // Populate sender details in response
    const populatedNotification = await notification.populate("sender_id", "name email image");

    return NextResponse.json({
      error: null,
      data: populatedNotification
    });

  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
