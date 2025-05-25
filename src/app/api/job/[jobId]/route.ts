import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/config/db";
import Job from "@/models/job";
import { auth } from "@/auth";
import Conversation from "@/models/conversation";
import { jobSchema } from "../schema";
import { fromZodError } from "zod-validation-error";
import mongoose, { PipelineStage } from "mongoose";
import Application from "@/models/application";

// Get single job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({
      error: "Unauthorized",
      data: null
    }, { status: 401 });
  }

  try {
    await connectDB();

    const { jobId } = await params;

    const job = await Job.findById(jobId).populate(
      "employerId",
      "name email image companyDetails"
    );

    if (!job) {
      return NextResponse.json({
        error: "Job not found",
        data: null
      }, { status: 404 });
    }

    return NextResponse.json({
      error: null,
      data: job
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        data: null
      },
      { status: 500 }
    );
  }
}

// Update job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({
      error: "Unauthorized",
      data: null
    }, { status: 401 });
  }

  if (session.user.role !== "employer") {
    return NextResponse.json({
      error: "Unauthorized",
      data: null
    }, { status: 401 });
  }

  try {
    await connectDB();

    const body = await request.json();

    const { jobId } = await params;

    // Validate request body
    const validationResult = jobSchema.safeParse(body);
    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return NextResponse.json(
        { error: validationError.message, data: null },
        { status: 400 }
      );
    }

    // Check if job exists and belongs to the HR
    const existingJob = await Job.findOne({
      _id: jobId,
      employerId: session.user.id,
    });

    if (!existingJob) {
      return NextResponse.json(
        {
          error: "Job not found or unauthorized",
          data: null
        },
        { status: 404 }
      );
    }

    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      validationResult.data,
      {
        new: true,
        runValidators: true,
      }
    ).populate("employerId", "name email image companyDetails");

    return NextResponse.json({
      error: null,
      data: updatedJob
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        data: null
      },
      { status: 500 }
    );
  }
}

// Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({
      error: "Unauthorized",
      data: null
    }, { status: 401 });
  }

  if (session.user.role !== "employer") {
    return NextResponse.json({
      error: "Unauthorized",
      data: null
    }, { status: 401 });
  }

  try {
    await connectDB();

    const { jobId } = await params;

    // Check if job exists and belongs to the HR
    const existingJob = await Job.findOne({
      _id: jobId,
      employerId: session.user.id,
    });

    if (!existingJob) {
      return NextResponse.json(
        {
          error: "Job not found",
          data: null
        },
        { status: 404 }
      );
    }

    // if some candidate is applied for this job
    const conversation = await Application.findOne({
      jobId,
    });

    if (conversation) {
      return NextResponse.json({
        error: "Job cannot be deleted as some candidate is applied for this job",
        data: null
      }, { status: 400 });
    }

    // Delete job
    await Job.findByIdAndDelete(jobId);

    return NextResponse.json({
      error: null,
      data: { message: "Job deleted successfully" }
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        data: null
      },
      { status: 500 }
    );
  }
} 