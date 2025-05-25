import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/config/db";
import Application from "@/models/application";
import Conversation from "@/models/conversation";
import { auth } from "@/auth";

// get applications details with the conversation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const candidateId = id;

    // Get the application with populated job and employer details
    const application = await Application.findOne({ candidateId })
      .populate({
        path: "jobId",
        select: "title about CTC jobType workExperience techStack employerId",
        populate: {
          path: "employerId",
          select: "name email image companyDetails"
        }
      });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found", data: null },
        { status: 404 }
      );
    }

    // Get all conversations for this candidate and job
    const conversations = await Conversation.find({
      candidateId: application.candidateId,
      jobId: application.jobId
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      error: null,
      data: {
        application,
        conversations
      },
    });
  } catch (error) {
    console.error("Error fetching candidate application details:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
} 