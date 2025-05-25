import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/config/db";
import Job from "@/models/job";
import Application from "@/models/application";
import User from "@/models/user/user";
import { auth } from "@/auth";
import mongoose from "mongoose";

// Get all applications for the logged-in candidate
export async function GET(request: NextRequest) {
  // Get status filter from query parameters using Next.js built-in method
  const searchParams = request.nextUrl.searchParams;
  const rawStatus = searchParams.get('status');
  const statusFilter = rawStatus ? rawStatus.replace(/[",']/g, '').toUpperCase() : null;
  
  console.log('Status filter:', statusFilter); // Debug log
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized", data: null },
      { status: 401 }
    );
  }

  // if (session.user.role !== "candidate") {
  //   return NextResponse.json(
  //     { error: "You are not authorized to access this page", data: null },
  //     { status: 401 }
  //   );
  // }

  try {
    await connectDB();

    const candidateId = new mongoose.Types.ObjectId(session.user.id);
    
    // Build match criteria based on status filter
    const matchCriteria: any = { 
      candidateId // Using the converted ObjectId
    };
    
    // Add hiring status filter if provided and valid
    const validStatuses = ['HIRED', 'REJECTED', 'PENDING'];
    if (statusFilter && validStatuses.includes(statusFilter)) {
      matchCriteria.hiringStatus = statusFilter;
      console.log('Filtering by status:', statusFilter);
    } else if (statusFilter) {
      console.log('Invalid status filter:', statusFilter);
      return NextResponse.json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        data: null
      }, { status: 400 });
    }

    console.log('Fetching applications with criteria:', matchCriteria);

    // Use a single aggregation pipeline for both filtered applications and counts
    const result = await Application.aggregate([
      {
        $facet: {
          // Get filtered applications
          applications: [
            { $match: matchCriteria },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: "jobs",
                localField: "jobId",
                foreignField: "_id",
                as: "job"
              }
            },
            { $unwind: "$job" },
            {
              $lookup: {
                from: "users",
                localField: "job.employerId",
                foreignField: "_id",
                as: "employer"
              }
            },
            { $unwind: "$employer" },
            {
              $project: {
                _id: 1,
                jobId: "$job._id",
                candidateId: 1,
                interviewstatus: 1,
                hiringStatus: 1,
                feedback: 1,
                overallScore: 1,
                communication: 1,
                createdAt: 1,
                updatedAt: 1,
                job: {
                  $mergeObjects: [
                    "$job",
                    {
                      employer: "$employer"
                    }
                  ]
                }
              }
            }
          ],
          // Get real counts for all statuses
          counts: [
            { 
              $match: { 
                candidateId // Get counts for current user only
              } 
            },
            {
              $group: {
                _id: null,
                totalApplications: { $sum: 1 },
                hired: {
                  $sum: {
                    $cond: [{ $eq: ["$hiringStatus", "HIRED"] }, 1, 0]
                  }
                },
                rejected: {
                  $sum: {
                    $cond: [{ $eq: ["$hiringStatus", "REJECTED"] }, 1, 0]
                  }
                },
                pending: {
                  $sum: {
                    $cond: [{ $eq: ["$hiringStatus", "PENDING"] }, 1, 0]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    // Get applications and counts from result
    const applications = result[0].applications || [];
    const counts = result[0].counts[0] || {
      totalApplications: 0,
      hired: 0,
      rejected: 0,
      pending: 0
    };

    // Combine applications and counts into a single data object
    const responseData = {
      applications,
      ...counts
    };

    return NextResponse.json({
      error: null,
      data: responseData
    });
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
} 