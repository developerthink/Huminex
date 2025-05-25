import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Job from "@/models/job";
import Application from "@/models/application";
import connectDB from "@/config/db";
import mongoose, { PipelineStage } from "mongoose";

type StatusCounts = {
  hiredCount: number;
  rejectedCount: number;
  pendingCount: number;
};

type ApplicationStats = any;

interface JobsAggregationResult {
  _id?: string;
  totalJobs: Array<{ count: number }>;
  recentJobs: Array<any>;
};

interface ApplicationsAggregationResult {
  _id?: string;
  statusCounts: Array<{
    _id: string;
    count: number;
  }>;
  recentApplications: ApplicationStats[];
};

export async function GET() {
   // Get the authenticated session
   const session = await auth();
   if (!session) {
      return NextResponse.json({
        error: "Unauthorized access",
        data: null
      }, { status: 401 });
   }

   if(session.user.role !== "employer") {
      return NextResponse.json({
        error: "Unauthorized access",
        data: null
      }, { status: 401 });
   }

  try {
   
    await connectDB();

    const employerId = new mongoose.Types.ObjectId(session.user.id);

    // Get jobs pipeline
    const jobsPipeline: PipelineStage[] = [
      { $match: { employerId } },
      {
        $facet: {
          totalJobs: [{ $count: 'count' }],
          recentJobs: [
            { $sort: { createdAt: -1 } },
            { $limit: 3 }
          ]
        }
      }
    ];

    // Get applications pipeline
    const applicationsPipeline: PipelineStage[] = [
      {
        $match: {
          jobId: {
            $in: await Job.find({ employerId }).distinct('_id')
          }
        }
      },
      {
        $facet: {
          statusCounts: [
            {
              $group: {
                _id: '$hiringStatus',
                count: { $sum: 1 }
              }
            }
          ],
          recentApplications: [
            { $sort: { createdAt: -1 } },
            { $limit: 3 },
            {
              $lookup: {
                from: 'users',
                localField: 'candidateId',
                foreignField: '_id',
                pipeline: [],
                as: 'candidate'
              }
            },
            {
              $lookup: {
                from: 'jobs',
                localField: 'jobId',
                foreignField: '_id',
                pipeline: [],
                as: 'job'
              }
            },
            {
              $addFields: {
                candidate: { $arrayElemAt: ['$candidate', 0] },
                job: { $arrayElemAt: ['$job', 0] }
              }
            }
          ]
        }
      }
    ];

    // Execute both pipelines in parallel
    const [jobsResult, applicationsResult] = await Promise.all([
      Job.aggregate<JobsAggregationResult>(jobsPipeline),
      Application.aggregate<ApplicationsAggregationResult>(applicationsPipeline)
    ]);

    // Extract values from results
    const jobsCount = jobsResult[0].totalJobs[0]?.count || 0;
    const recentJobs = jobsResult[0].recentJobs;

    const statusCounts = applicationsResult[0].statusCounts.reduce((acc: StatusCounts, curr) => {
      acc[`${curr._id.toLowerCase()}Count` as keyof StatusCounts] = curr.count;
      return acc;
    }, { hiredCount: 0, rejectedCount: 0, pendingCount: 0 });

    const recentApplications = applicationsResult[0].recentApplications;

    return NextResponse.json({
      error: null,
      data: {
        jobsCount,
        applicationStats: {
          hiredCount: statusCounts.hiredCount,
          rejectedCount: statusCounts.rejectedCount,
          pendingCount: statusCounts.pendingCount
        },
        recentJobs,
        recentApplications
      }
    });
  } catch (error: any) {
    console.error("Error in employer analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
