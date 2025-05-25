import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/config/db";
import Application from "@/models/application";
import Job from "@/models/job";
import { auth } from "@/auth";

// Get applications by job ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
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

    const { jobId } = await params;

    // First check if the job exists and belongs to the user
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: "Job not found", data: null },
        { status: 404 }
      );
    }

    // Get all applications for this job
    const applications = await Application.find({ jobId })
      .populate("candidateId") // Populate candidate details
      .populate("jobId"); // Populate job details

    return NextResponse.json({
      error: null,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
