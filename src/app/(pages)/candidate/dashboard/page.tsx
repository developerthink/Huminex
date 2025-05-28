"use client";
import React from "react";
import { FileText, ClipboardCheck, Users, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import TableNex from "react-tablenex";
import "react-tablenex/style.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllJobs } from "@/lib/api-functions/cnadidate/jobs.api";
import JobCard from "@/components/job-card";
import WbLoader from "@/components/global-cmp/wbLoader";
import Link from "next/link";

type Application = {
  jobId: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  jobType: string;
  status: string;
  appliedDate: string;
  [key: string]: any;
};

// API functions
const fetchProfileCompletion = async () => {
  const response = await axios.get("/api/candidate/profile-completion");
  return response.data.data;
};

// Component
const Dashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("recommended");

  const fetchApplications = async () => {
    const response = await axios.get("/api/applications/user");
    const { applications, totalApplications, hired, rejected, pending } =
      response.data.data;
    return {
      stats: { totalApplications, hired, rejected, pending },
      applications: applications.map((application: any) => ({
        jobId: application.job._id,
        title: application.job.title,
        company: application.job.employer.companyDetails.name,
        logo: application.job.employer.companyDetails.logo,
        location: application.job.location,
        jobType: application.job.jobType,
        status: application.interviewstatus || "PENDING",
        hiringStatus: application.hiringStatus || "PENDING",
        appliedDate: new Date(application.createdAt).toLocaleDateString(),
      })),
    };
  };

  // TanStack Query hooks
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profileCompletion"],
    queryFn: fetchProfileCompletion,
    initialData: {
      completionPercentage: 0,
      missingFields: [],
      isComplete: false,
    },
  });

  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => fetchAllJobs(),
  });
  const {
    data: applicationData,
    isLoading: applicationsLoading,
    error,
  } = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
    initialData: {
      stats: { totalApplications: 0, hired: 0, rejected: 0, pending: 0 },
      applications: [],
    },
  });

  const columns = [
    { header: "ID", accessor: "jobId", hidden: true },

    {
      header: "Company",
      accessor: "company",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <Image
              src={row.logo || "/default-company-logo.png"}
              alt={row.company}
              fill
              className=" object-cover"
            />
          </div>
          <span>{row.company}</span>
        </div>
      ),
    },
    { header: "Job Title", accessor: "title" },
    {
      header: "Location",
      accessor: "location",
      render: (_: any, row: any) =>
        row.location.charAt(0).toUpperCase() + row.location.slice(1),
    },
    {
      header: "Job Type",
      accessor: "jobType",
      render: (_: any, row: any) =>
        row.jobType.charAt(0).toUpperCase() + row.jobType.slice(1),
    },
    {
      header: "Status",
      accessor: "status",
      render: (_: any, row: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${row.hiringStatus === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : row.hiringStatus === "HIRED"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
        >
          {row.hiringStatus.charAt(0).toUpperCase() + row.hiringStatus.slice(1)}
        </span>
      ),
    },
    { header: "Applied Date", accessor: "appliedDate" },
  ];

  if (jobsLoading || applicationsLoading) {
    return <WbLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-100 m-1 rounded-lg">
      <div className="px-4 sm:px-6 py-4">
        <div className="space-y-6">
          {/* Profile Completeness */}
          <section>
            <div className="grid grid-cols-[3.5fr_2fr] gap-4">
              <div>
                <div className="rounded-lg overflow-hidden shadow-sm p-6 bg-white">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Profile Completeness
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="relative bgGrad text-white rounded-lg border-2 border-green-100 h-48 flex items-center justify-center w-full">
                        <div className="text-center mt-1.5">
                          <div className="text-6xl font-bold ">
                            {profileLoading
                              ? "..."
                              : `${profileData.completionPercentage}%`}
                          </div>
                          <p className="text-sm mt-2">
                            of your profile is
                            <br />
                            {profileData.isComplete ? "complete" : "incomplete"}
                            .
                          </p>
                        </div>
                      </div>
                      {/* <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-600 text-sm mb-4">
                          {profileLoading
                            ? "Loading profile information..."
                            : profileData.isComplete
                            ? "Great job completing your profile!"
                            : "You're on the right track! Complete your profile to get noticed"}
                        </p>
                        <Button
                          className="bg-green-500 hover:bg-green-600 transition-colors text-white font-medium py-2 px-4 rounded-md w-fit"
                          onClick={() =>
                            router.push("/candidate/dashboard/profile")
                          }
                        >
                          Complete Now
                        </Button>
                      </div> */}
                    </div>
                    {/* <div className="flex-1 flex flex-col justify-center"></div> */}
                    <div className="bg-orange-50 !text-nowrap p-4 border-2 border-orange-100 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-3">
                        {profileLoading
                          ? "Loading..."
                          : profileData.missingFields.length > 0
                            ? "Missing Information:"
                            : "All information complete!"}
                      </h4>
                      <ul className="space-y-4">
                        {profileLoading ? (
                          <li>Loading missing fields...</li>
                        ) : profileData.missingFields.length > 0 ? (
                          profileData.missingFields
                            .slice(0, 2)
                            .map((field: string, index: number) => (
                              <Link href={'/candidate/dashboard/profile'}>
                                <li
                                  key={index}
                                  className="flex items-center gap-3 cursor-pointer hover:bg-orange-100 p-1 rounded transition-colors"
                                >
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-orange-500" />
                                  </div>
                                  <span className="text-gray-700">{field}</span>
                                </li>
                              </Link>
                            ))
                        ) : (
                          <li className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <ClipboardCheck className="w-4 h-4 text-green-500" />
                            </div>
                            <span className="text-gray-700">
                              All profile sections complete!
                            </span>
                          </li>
                        )}
                      </ul>
                      {profileData.missingFields.length > 2 && (
                        <Link href={'/candidate/dashboard/profile'}>
                          <div
                            className="mt-4 text-orange-600 text-sm font-medium cursor-pointer hover:underline"
                          >
                            +{profileData.missingFields.length - 2} more details
                            missing
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <section className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        label: "Total Applications",
                        value: applicationData.stats.totalApplications,
                        icon: ClipboardCheck,
                        color: "bg-blue-50",
                        iconColor: "text-blue-500",
                      },
                      {
                        label: "Pending",
                        value: applicationData.stats.pending,
                        icon: ClipboardList,
                        color: "bg-yellow-50",
                        iconColor: "text-yellow-600",
                      },
                      {
                        label: "Hired",
                        value: applicationData.stats.hired,
                        icon: Users,
                        color: "bg-green-50",
                        iconColor: "text-green-500",
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-transform hover:transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}
                          >
                            <stat.icon
                              className={`w-6 h-6 ${stat.iconColor}`}
                            />
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-gray-900">
                              {stat.value}
                            </div>
                            <div className="text-sm text-gray-600">
                              {stat.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <div className="flex-1 shadow rounded-2xl bg-white p-4">
                <Tabs
                  defaultValue="recommended"
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as "recommended" | "invited")
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recommended">Recommended</TabsTrigger>
                    <TabsTrigger value="invited">Invited</TabsTrigger>
                  </TabsList>
                  <div className="max-h-96 overflow-hidden overflow-y-auto">
                    <TabsContent value="recommended">
                      <div className="mt-4 text-gray-700">
                        {/* <h3 className="text-lg font-semibold mb-2">
                          Recommended Jobs
                        </h3>
                        <p className="text-gray-600">
                          Jobs tailored to your profile and preferences.
                        </p> */}
                        {jobsData?.recommendedJobs.map((job: any) => (
                          <JobCard hasMore={false} key={job._id} job={job} />
                        ))}
                        {jobsData?.recommendedJobs.length === 0 && (
                          <div className="grid place-items-center">
                            <Image
                              src="/no-job.png"
                              alt="No Invitations"
                              width={200}
                              height={200}
                            />
                            <p className="text-gray-500 text-center py-4">
                              No recommended jobs found. Update your skills to
                              get personalized recommendations.
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="invited">
                      <div className="mt-4 text-gray-700 text-center">
                        {/* <h3 className="text-lg font-semibold mb-2">
                          Invited Jobs
                        </h3>
                        <p className="text-gray-600">
                          Jobs you've been invited to apply for.
                        </p> */}
                        <div>
                          {jobsData?.invitedJobs.map((job: any) => (
                            <JobCard hasMore={false} key={job._id} job={job} />
                          ))}
                          {jobsData?.invitedJobs.length === 0 && (
                            <div className="grid place-items-center">
                              <Image
                                src="/no-job.png"
                                alt="No Invitations"
                                width={200}
                                height={200}
                              />
                              <p className="text-gray-500 text-center py-4">
                                No invitations yet. Keep your profile updated to
                                receive job invites.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </section>

          {/* Interview Stats */}

          {/* Recent Interviews */}
          <section>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Your Recent Interviews
              </h2>
              <TableNex
                data={applicationData.applications.slice(0, 3) || []}
                noDataMessage={
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ClipboardList className=" wszelkie-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No recent interviews</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Your scheduled interviews will appear here
                    </p>
                  </div>
                }
                keyField={{
                  keyId: "jobId",
                  isVisible: false,
                }}
                responsive={true}
                colorScheme={{
                  ACCENT: "var(--primary)",
                }}
                columns={columns}
              />
              {applicationData.applications.length > 3 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() =>
                      router.push("/candidate/dashboard/applications")
                    }
                  >
                    View all {applicationData.applications.length} applications
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
