import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/config/db";
import Application from "@/models/application";
import '../../../../../models/job';
import { auth } from "@/auth";
import { applicationStatusSchema } from "./schema";
import { fromZodError } from "zod-validation-error";


// Update application status
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

  try {
    await connectDB();
    const body = await request.json();

    // Validate request body
    const validationResult = applicationStatusSchema.safeParse(body);
    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return NextResponse.json(
        { error: validationError.message, data: null },
        { status: 400 }
      );
    }

    const { hiringStatus } = validationResult.data;

    const { applicationId } = await params;

    // Update the application status
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { hiringStatus },
      { new: true, runValidators: true }
    )
      .populate("candidateId", "name email image")
      .populate("jobId", "title about CTC");

    if (!updatedApplication) {
      return NextResponse.json(
        { error: "Application not found", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      error: null,
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
} 