import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/config/db";
import Job from "@/models/job";
import Application from "@/models/application";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

// Get all job applications for the employer's jobs
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ 
      error: "Unauthorized",
      data: null 
    }, { status: 401 });
  }

  try {
    await connectDB();

    const applications = await Application.aggregate([
      // First stage: Join with jobs collection
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job"
        }
      },
      // Filter jobs by employer ID
      {
        $match: {
          "job.employerId": new mongoose.Types.ObjectId(session.user.id)
        }
      },
      // Join with users collection for candidate details
      {
        $lookup: {
          from: "users",
          localField: "candidateId",
          foreignField: "_id",
          as: "candidate"
        }
      },
      // Unwind the arrays created by $lookup
      {
        $unwind: "$job"
      },
      {
        $unwind: "$candidate"
      },
      // Keep all fields and rename job and candidate
      {
        $project: {
          _id: 1,
          interviewstatus: 1,
          hiringStatus: 1,
          feedback: 1,
          overallScore: 1,
          communication: 1,
          createdAt: 1,
          updatedAt: 1,
          job: "$job",
          candidate: "$candidate"
        }
      },
      // Sort by creation date
      {
        $sort: { createdAt: -1 }
      }
    ]);

    revalidatePath("/employer/dashboard/all-applicants");

    return NextResponse.json({
      error: null,
      data: applications
    });
  } catch (error) {
    console.error("Error fetching job responses:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        data: null 
      },
      { status: 500 }
    );
  }
}   