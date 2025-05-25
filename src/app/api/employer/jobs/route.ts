import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/config/db";
import Job from "@/models/job";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Get all jobs of the employer
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

    const job = await Job.find({employerId: session.user.id})
      .sort({ createdAt: -1 });

    if (!job) {
      return NextResponse.json({ 
        error: "Job not found",
        data: null 
      }, { status: 404 });
    }

    revalidatePath("/employer/dashboard/jobs");

    return NextResponse.json({
      error: null,
      data: job
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        data: null 
      },
      { status: 500 }
    );
  }
}