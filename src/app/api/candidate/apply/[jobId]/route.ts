import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/config/db';
import Application from '@/models/application';
import Job from '@/models/job';
import { jobApplicationSchema } from './schema';
import { fromZodError } from 'zod-validation-error';
import { auth } from '@/auth';

export async function POST(
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

  if (session.user.role !== "candidate") {
    return NextResponse.json({
      error: "You are not a candidate",
      data: null
    }, { status: 401 });
  }

  try {
    await connectDB();

    const { jobId } = await params;
    const candidateId = session.user.id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({
        error: 'Job not found',
        data: null
      }, { status: 404 });
    }

    // Check if application already exists
    const existingApplication = await Application.findOne({ jobId, candidateId });
    if (existingApplication) {
      return NextResponse.json({
        error: 'You have already applied for this job',
        data: null
      }, { status: 400 });
    }

    // Create a new application
    const application = await Application.create({
      jobId,
      candidateId,
      interviewstatus: 'PENDING',
      hiringStatus: 'PENDING',
      overallScore: 0,
      communication: 'AVERAGE'
    });

    return NextResponse.json({
      error: null,
      data: {
        applicationId: application._id,
        status: application.hiringStatus
      }
    });

  } catch (error) {
    console.error('Error submitting job application:', error);
    return NextResponse.json({
      error: 'Internal server error',
      data: null
    }, { status: 500 });
  }
} 