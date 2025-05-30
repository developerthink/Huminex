import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/config/db";
import Job from "@/models/job";
import Application from "@/models/application";
import Candidate from "@/models/user/candidate";
import { auth } from "@/auth";
import { jobSchema } from "./schema";
import { fromZodError } from "zod-validation-error";
import mongoose, { PipelineStage } from "mongoose";
import type { JobType } from "@/types/models/job";
import { createNotificationAction } from "@/actions/notification";
import User from "@/models/user/user";

// Get all jobs
export async function GET(request: NextRequest) {
  const session = await auth();
  try {
    await connectDB();

    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('search');


    // Pipeline stages for populating employer details and sorting
    const employerDetailsPipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "users",
          localField: "employerId",
          foreignField: "_id",
          as: "employerId"
        }
      } as PipelineStage,
      {
        $unwind: {
          path: "$employerId",
          preserveNullAndEmptyArrays: true
        }
      } as PipelineStage,
      {
        $sort: { 
          createdAt: -1 
        }
      } as PipelineStage
    ];

    // If user is not logged in, return all jobs without recommendations
    if (!session) {
      const jobs = await Job.aggregate(employerDetailsPipeline);
      return NextResponse.json({
        error: null,
        data: {
          allJobs: jobs,
          recommendedJobs: [],
          invitedJobs: [],
        }
      });
    }

    // If user is logged in, get candidate details
    const candidate = await Candidate.findOne({
      _id: new mongoose.Types.ObjectId(session.user.id)
    }).select('skill');

    // Base pipeline for getting all jobs (excluding applied ones)
    const jobsPipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "applications",
          let: { jobId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$jobId", "$$jobId"] },
                    { $eq: ["$candidateId", new mongoose.Types.ObjectId(session?.user?.id)] }
                  ]
                }
              }
            }
          ],
          as: "applications"
        }
      } as PipelineStage,
      {
        $match: {
          applications: { $size: 0 }
        }
      } as PipelineStage,
      ...employerDetailsPipeline,
      {
        $project: {
          applications: 0 // Exclude applications field from output
        }
      } as PipelineStage
    ];

    // Get invited jobs for the current user
    const invitedJobsPipeline: PipelineStage[] = [
      {
        $match: {
          'invitedCandidates': {
            $elemMatch: { 
              email: session.user.email 
            }
          }
        }
      } as PipelineStage,
      ...employerDetailsPipeline
    ];

    // Get all jobs without search filter for recommendations
    const allJobsUnfiltered = await Job.aggregate<JobType>([
      ...jobsPipeline,
      {
        $lookup: {
          from: "applications",
          let: { jobId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$jobId", "$$jobId"] },
                    { $eq: ["$candidateId", new mongoose.Types.ObjectId(session?.user?.id)] }
                  ]
                }
              }
            }
          ],
          as: "applications"
        }
      } as PipelineStage,
      {
        $match: {
          applications: { $size: 0 }
        }
      } as PipelineStage,
    ]);

    // Get filtered jobs for all jobs section
    const searchedJobs = searchQuery ? await Job.aggregate<JobType>([
      ...jobsPipeline,
      {
        $match: {
          title: {
            $regex: searchQuery.replace(/["]/g, ''),
            $options: 'i'
          }
        }
      } as PipelineStage
    ]) : allJobsUnfiltered;

    const invitedJobs = await Job.aggregate<JobType>(invitedJobsPipeline);

    // Filter recommended jobs from unfiltered jobs list
    const recommendedJobs = allJobsUnfiltered.filter((job: JobType) => {
      if (!candidate?.skill || !job.techStack || !Array.isArray(job.techStack)) return false;
      
      // Ensure both arrays exist and are arrays
      const candidateSkills: string[] = Array.isArray(candidate.skill) ? candidate.skill : [];
      const jobTechStack: string[] = Array.isArray(job.techStack) ? job.techStack : [];

      // Normalize skills for comparison (remove special chars, convert to lowercase)
      const normalizeSkill = (skill: string) => {
        return skill.toLowerCase()
          .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
          .trim();
      };

      const normalizedCandidateSkills = candidateSkills.map(normalizeSkill);
      const normalizedJobTechStack = jobTechStack.map(normalizeSkill);

      // Check if any of the candidate's skills partially match any of the job's required skills
      return normalizedCandidateSkills.some(candidateSkill => 
        normalizedJobTechStack.some(jobSkill => 
          jobSkill.includes(candidateSkill) || candidateSkill.includes(jobSkill)
        )
      );
    });

    return NextResponse.json({
      error: null,
      data: {
        allJobs: searchedJobs,
        recommendedJobs,
        invitedJobs,
      },
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

// Create a new job
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ 
      error: "Unauthorized",
      data: null 
    }, { status: 401 });
  }

  // if(session.user.role !== "employer") {
  //   return NextResponse.json({
  //     error: "Unauthorized",
  //     data: null
  //   }, { status: 401 });
  // }

  try {
    await connectDB();

    const body = await request.json();

    // Validate request body
    const validationResult = jobSchema.safeParse(body);
    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return NextResponse.json(
        { error: validationError.message, data: null },
        { status: 400 }
      );
    }

    // Create job with employer ID from session
    const job = await Job.create({
      ...validationResult.data,
      price: 100,
      employerId: session.user.id
    });

    if (validationResult.data.invitedCandidates?.length) {
      try {
        // First find all users concurrently
        const userPromises = validationResult.data.invitedCandidates.map(candidate =>
          User.findOne({ email: candidate.email })
        );
        const users = await Promise.all(userPromises);

        // Then create all notifications concurrently
        const notificationPromises = users
          .filter(user => user !== null)
          .map(user =>
            createNotificationAction({
              title: "Job Invitation",
              content: `You have been invited to apply for this job <a href="/jobs/${job._id}"><b>${job.title}</b></a>`,
              sender_id: session?.user.id,
              receiver_id: user?._id,
            })
          );

        // Wait for all notifications to complete
        await Promise.all(notificationPromises);
      } catch (error) {
        console.error('Error sending notifications:', error);
        // Continue with job creation even if notifications fail
      }
    }


    return NextResponse.json({
      error: null,
      data: job
    });

  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
}