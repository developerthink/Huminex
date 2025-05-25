'use client'
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEmployerAnalytics } from '@/lib/api-functions/employer/analytics.api';
import { Plus, Users, MessageSquare, Clock, UserCheck, Clipboard, Star } from 'lucide-react';
import TableNex from 'react-tablenex';
import 'react-tablenex/style.css';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import WbLoader from '@/components/global-cmp/wbLoader';

const DashboardCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, value, label, bgColor = "bg-gray-50" }: { icon: any; value: any; label: any; bgColor?: string }) => (
  <DashboardCard className="p-6">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className="h-6 w-6 text-gray-600" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  </DashboardCard>
);

const CircularProgress = ({ value, max, label }: { value: number; max: number; label: string }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#22c55e"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{value}</span>
          <span className="text-sm text-gray-500 ml-1">of {max}</span>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-600">{label}</div>
    </div>
  );
};

const StarRating = ({ rating = 5 }) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
      />
    ))}
  </div>
);

export default function RecruitmentDashboard() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['employerAnalytics'],
    queryFn: getEmployerAnalytics,
  });

  if (isLoading) {
    return <WbLoader />;
  }

  const { jobsCount, applicationStats, recentJobs, recentApplications } = analyticsData.data;

  // Calculate total invited candidates
  const totalInvitedCandidates = recentJobs.reduce(
    (sum: number, job: any) => sum + (job.invitedCandidates?.length || 0),
    0
  );

  // Job Posts Table Configuration
  const jobColumns = [
    { accessor: 'id', header: 'Job ID', isVisible: false },
    {
      accessor: 'jobTitle',
      header: 'Job Title',
      render: (_: any, row: any) => (
        <Link href={`/employer/dashboard/jobs/applications/${row.id}`} className="text-primary hover:underline">
          {row.jobTitle}
        </Link>
      ),
    },
    { accessor: 'jobType', header: 'Job Type' },
    { accessor: 'location', header: 'Location' },
    {
      accessor: 'ctcRange',
      header: 'CTC Range',
      render: (_: any, row: any) => <h3 className="text-nowrap italic">{row.ctcRange}</h3>,
    },
    {
      accessor: 'workExperience',
      header: 'Work Exp',
      render: (_: any, row: any) => <h3>{row.workExperience} yrs</h3>,
    },
    { accessor: 'openings', header: 'Openings' },
    {
      accessor: 'interviewDuration',
      header: 'Duration',
      render: (_: any, row: any) => <h3>{row.interviewDuration} min</h3>,
    },
    {
      accessor: 'difficultyLevel',
      header: 'Difficulty Level',
      render: (_: any, row: any) => (
        <h3
          className={`text-nowrap rounded-full px-2 py-0.5 text-sm uppercase ${row.difficultyLevel === 'easy'
            ? 'text-green-500 bg-green-500/30'
            : row.difficultyLevel === 'medium'
              ? 'bg-yellow-500/30 text-yellow-500'
              : 'bg-red-500/30 text-red-500'
            }`}
        >
          {row.difficultyLevel}
        </h3>
      ),
    },
    {
      accessor: 'techStack',
      header: 'Tech Stack',
      render: (_: any, row: any) => (
        <h3 className="text-nowrap truncate hover:w-auto hover:text-wrap w-[100px]">
          {row.techStack.join(', ')}
        </h3>
      ),
    },
    {
      accessor: 'actions',
      header: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex flex-col gap-2">
          <button
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
          >
            View
          </button>
        </div>
      ),
    },
  ];

  const jobTableData = recentJobs.map((job: any) => ({
    id: job._id,
    jobTitle: job.title,
    jobType: job.jobType,
    location: job.location,
    ctcRange: `${job.salaryRange.start} - ${job.salaryRange.end} LPA`,
    workExperience: job.workExperience,
    openings: job.interviewSettings.maxCandidates,
    interviewDuration: job.interviewSettings.interviewDuration,
    difficultyLevel: job.interviewSettings.difficultyLevel,
    techStack: job.techStack,
  }));

  // Recent Applications Table Configuration
  const applicationColumns = [
    { accessor: 'id', header: 'Application ID', isVisible: false },
    {
      accessor: 'jobTitle',
      header: 'Job Title',
      render: (_: any, row: any) => (
        <Link href={`/employer/dashboard/jobs/applications/${row.jobId}`} className="text-primary hover:underline">
          {row.jobTitle}
        </Link>
      ),
    },
    { accessor: 'candidateName', header: 'Candidate Name' },
    {
      accessor: 'interviewStatus',
      header: 'Interview Status',
      render: (_: any, row: any) => (
        <h3
          className={`text-nowrap rounded-full px-2 py-0.5 text-sm uppercase ${row.interviewStatus === 'PENDING'
            ? 'text-yellow-500 bg-yellow-500/30'
            : row.interviewStatus === 'COMPLETED'
              ? 'text-green-500 bg-green-500/30'
              : 'text-red-500 bg-red-500/30'
            }`}
        >
          {row.interviewStatus}
        </h3>
      ),
    },
    {
      accessor: 'hiringStatus',
      header: 'Hiring Status',
      render: (_: any, row: any) => (
        <h3
          className={`text-nowrap rounded-full px-2 py-0.5 text-sm uppercase ${row.hiringStatus === 'HIRED'
            ? 'text-green-500 bg-green-500/30'
            : row.hiringStatus === 'REJECTED'
              ? 'text-red-500 bg-red-500/30'
              : 'text-gray-500 bg-gray-500/30'
            }`}
        >
          {row.hiringStatus}
        </h3>
      ),
    },
    { accessor: 'communication', header: 'Communication' },
    {
      accessor: 'createdAt',
      header: 'Applied On',
      render: (_: any, row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      accessor: 'actions',
      header: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex items-center justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="flex flex-col gap-2">
                <button
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
                >
                  View
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ),
    },
  ];

  const applicationTableData = recentApplications.map((app: any) => ({
    id: app._id,
    jobId: app.jobId,
    jobTitle: app.job.title,
    candidateName: app.candidate.name,
    interviewStatus: app.interviewstatus,
    hiringStatus: app.hiringStatus,
    communication: app.communication,
    createdAt: app.createdAt,
  }));

  return (
    <div className="min-h-screen mt-5 bg-gray-50">
      <div className="">
        {/* Header */}
        {/* <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hi Akhil Adarsh Tiwari!</h1>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Create New Interview</span>
          </button>
        </div> */}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="col-span-4 grid grid-cols-4 gap-4">
            {/* Job Posts */}
            <DashboardCard className="p-6 text-white bgGrad">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <Clipboard className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-4xl font-bold">{jobsCount}</div>
                  <div className="text-gray-300 text-xl">Job posts</div>
                </div>
              </div>
            </DashboardCard>

            <div className="col-span-3 grid grid-cols-2 gap-4">
              <StatCard
                icon={MessageSquare}
                value={applicationStats.hiredCount + applicationStats.rejectedCount + applicationStats.pendingCount}
                label="Total Interview Responses"
              />
              <StatCard
                icon={Clock}
                value={applicationStats.pendingCount}
                label="Pending Candidates"
              />
              <StatCard
                icon={UserCheck}
                value={applicationStats.hiredCount}
                label="Hired Candidates"
              />
              <StatCard
                icon={Users}
                value={applicationStats.rejectedCount}
                label="Rejected Candidates"
              />
            </div>


          </div>

          {/* Hiring Stage Funnel */}
          {/* <DashboardCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hiring Stage Funnel</h3>
            {applicationStats.hiredCount + applicationStats.rejectedCount + applicationStats.pendingCount === 0 ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">No Hiring Stages Found</div>
                  <div className="text-sm text-gray-500">Your hiring stages will appear here as candidates progress.</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Pending</span>
                  <span>{applicationStats.pendingCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hired</span>
                  <span>{applicationStats.hiredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rejected</span>
                  <span>{applicationStats.rejectedCount}</span>
                </div>
              </div>
            )}
          </DashboardCard> */}
        </div>

        {/* Bottom Section */}
        <div className="">
          <div className="">
            {/* Recent Job Posts */}

            <h3 className="text-lg font-semibold mb-2">Recent Job Posts</h3>
            {jobTableData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Clipboard className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 mb-1">No Interview Found</div>
                  <div className="text-sm text-gray-500">Create an interview to view</div>
                </div>
              </div>
            ) : (

              <TableNex
                columns={jobColumns}
                styles={{
                  spacing: 'lg',
                  rounded: 'lg',
                }}
                keyField={{
                  keyId: 'id',
                  isVisible: false,
                }}
                colorScheme={{
                  ACCENT: 'var(--primary)',
                  BORDER: 'var(--input)',
                  PRIMARY: 'var(--background)',
                  SECONDARY: '#F5F7F6',
                }}
                data={jobTableData}
              />
            )}

            <h3 className="text-lg font-semibold mb-2 mt-6">Recent Responses</h3>
            {applicationTableData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 mb-1">No Responses Yet</div>
                  <div className="text-sm text-gray-500">Responses will appear here</div>
                </div>
              </div>
            ) : (
              <TableNex
                columns={applicationColumns}
                styles={{
                  spacing: 'lg',
                  rounded: 'lg',
                }}
                keyField={{
                  keyId: 'id',
                  isVisible: false,
                }}
                colorScheme={{
                  ACCENT: 'var(--primary)',
                  BORDER: 'var(--input)',
                  PRIMARY: 'var(--background)',
                  SECONDARY: '#F5F7F6',
                }}
                data={applicationTableData}
              />
            )}
          </div>

          {/* Plan & Rating Section */}
          {/* <div className="space-y-6 col-span-1">
            <DashboardCard className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-400 rounded transform rotate-12"></div>
                  <span className="font-semibold">Starter</span>
                </div>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">14-DAY TRIAL</span>
              </div>
              <div className="mb-4">
                <CircularProgress value={10} max={10} label="Responses left" />
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-colors">
                  Switch To Pro
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors">
                  Upgrade →
                </button>
              </div>
            </DashboardCard>
            <DashboardCard className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">G</span>
              </div>
              <StarRating rating={5} />
            </DashboardCard>
          </div> */}
        </div>
      </div>
    </div>
  );
}