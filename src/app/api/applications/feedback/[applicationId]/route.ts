import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/config/db";
import Application from "@/models/application";
import { auth } from "@/auth";
import { applicationFeedbackSchema, ApplicationFeedbackInput } from "./schema";

// Update application feedback by application ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized", data: null },
      { status: 401 }
    );
  }

  // Check if user is an employer
  if (session.user.role !== "employer") {
    return NextResponse.json(
      { error: "Only employers can update feedback", data: null },
      { status: 403 }
    );
  }

  try {
    await connectDB();

    const { applicationId } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = applicationFeedbackSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.errors,
          data: null
        },
        { status: 400 }
      );
    }

    const feedbackData: ApplicationFeedbackInput = validationResult.data;

    // Find the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found", data: null },
        { status: 404 }
      );
    }

    // Update the application with feedback
    application.feedback = feedbackData.feedback;

    await application.save();

    return NextResponse.json({
      error: null,
      data: application,
      message: "Feedback updated successfully"
    });
  } catch (error) {
    console.error("Error updating application feedback:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
