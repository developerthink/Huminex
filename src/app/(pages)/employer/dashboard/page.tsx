'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployerAnalytics } from '@/lib/api-functions/employer/analytics.api';
import { updateHiringStatus } from '@/lib/api-functions/employer/job-response.api';
import { Clipboard, MoreHorizontal, Pencil, Trash, FileText, Users, BarChart, User } from 'lucide-react';
import TableNex from 'react-tablenex';
import 'react-tablenex/style.css';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import CreateJob from '@/components/employer-cmp/create-job';
import WbLoader from '@/components/global-cmp/wbLoader';
import { Button } from '@/components/ui/button';

type HiringStatus = 'PENDING' | 'HIRED' | 'REJECTED';
type TableData = Record<string, any>;

const fetchJobs = async () => {
  const response = await axios.get('/api/employer/jobs');
  return response.data.data;
};

const deleteJob = async (jobId: string) => {
  const response = await axios.delete(`/api/job/${jobId}`);
  return response.data;
};

const DashboardCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>{children}</div>
);

const StatCard = ({ icon: Icon, value, label, bgColor = 'bg-gray-50' }: { icon: any; value: any; label: any; bgColor?: string }) => (
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

export default function RecruitmentDashboard() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['employerAnalytics'],
    queryFn: getEmployerAnalytics,
  });
  const queryClient = useQueryClient();
  const [tableData, setTableData] = useState<any[]>([]);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error);
        return;
      }
      toast.success('Job deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['emp-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['employerAnalytics'] });
      setDeleteJobId(null);
    },
    onError: (error: any) => {
      console.error('Error deleting job:', error);
      toast.error(error.response.data.error || 'Failed to delete job');
      setDeleteJobId(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: HiringStatus }) =>
      updateHiringStatus(applicationId, status),
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['jobResponses'] });
      queryClient.invalidateQueries({ queryKey: ['employerAnalytics'] });
    },
    onError: (error: any) => {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    },
  });

  React.useEffect(() => {
    if (analyticsData?.data?.recentJobs) {
      const tableData = analyticsData.data.recentJobs.map((job: any) => ({
        id: job._id,
        jobTitle: <Link href={`/employer/dashboard/jobs/applications/${job._id}`} className="text-primary hover:underline">{job.title}</Link>,
        jobType: job.jobType,
        location: job.location,
        ctcRange: `${job.salaryRange.start} - ${job.salaryRange.end} LPA`,
        workExperience: job.workExperience,
        openings: job.interviewSettings.maxCandidates,
        interviewDuration: job.interviewSettings.interviewDuration,
        difficultyLevel: job.interviewSettings.difficultyLevel,
        techStack: job.techStack,
        actions: (
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
                    onClick={() => setEditingJobId(job._id)}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <Link
                    href={`/jobs/${job._id}`}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    View Job
                  </Link>
                  <Link
                    href={`/employer/jobs/applications/${job._id}`}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
                  >
                    <Users className="h-4 w-4" />
                    View Applicants
                  </Link>
                  <button
                    onClick={() => setDeleteJobId(job._id)}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm text-red-600"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <CreateJob
              jobToEdit={job}
              isEditing={true}
              open={editingJobId === job._id}
              onOpenChange={(open) => !open && setEditingJobId(null)}
              onSubmit={() => {
                setEditingJobId(null);
              }}
            />
          </div>
        ),
        ...job,
      }));
      setTableData(tableData);
    }
  }, [analyticsData?.data?.recentJobs]);

  console.log("the analytics data", analyticsData);

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
    { accessor: 'candidateEmail', header: 'Candidate Email' },
    {
      accessor: 'Analytics',
      header: 'Interview analytics',
      render: (_: any, row: any) => (
        row.interviewStatus === 'PENDING' ? (
          <Button variant="outline" disabled>
            <BarChart className="h-4 w-4" />
            PENDING
          </Button>
        ) : (
          <Link href={`/interview/${row.id}/analytics`}>
            <Button variant="outline">
              <BarChart className="h-4 w-4" />
              View Analytics
            </Button>
          </Link>
        )
      ),
    },
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
        <div className="relative">
          {updateStatusMutation.isPending && updateStatusMutation.variables?.applicationId === row.id ? (
            <div className="flex justify-center items-center w-32 h-10">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-600"></div>
            </div>
          ) : (
            <Select
              value={row.hiringStatus}
              onValueChange={(value: HiringStatus) => updateStatusMutation.mutate({ applicationId: row.id, status: value })}
            >
              <SelectTrigger
                className={` !border-none !outline-none !select-none !px-4 ${row.hiringStatus === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-700'
                    : row.hiringStatus === 'HIRED'
                      ? 'bg-green-100 text-green-700 border-green-700'
                      : 'bg-red-100 text-red-700 border-red-700'
                  }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING" className="">Pending</SelectItem>
                <SelectItem value="HIRED" className="">Hired</SelectItem>
                <SelectItem value="REJECTED" className="">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      ),
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
                {row.interviewStatus === 'PENDING' ? (
                  <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 rounded-md w-full text-left text-sm">
                    <BarChart className="h-4 w-4" />
                    View Analytics
                  </div>
                ) : (
                  <Link
                    href={`/interview/${row.id}/analytics`}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
                  >
                    <BarChart className="h-4 w-4" />
                    View Analytics
                  </Link>
                )}
                <Link
                  href={`/candidates/${row.candidateId}`}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
                >
                  <User className="h-4 w-4" />
                  View Candidate
                </Link>
                <Link
                  href={`/jobs/${row.jobId}`}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
                >
                  <FileText className="h-4 w-4" />
                  View Job
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ),
    },
    {
      accessor: 'createdAt',
      header: 'Applied On',
      render: (_: any, row: any) => format(new Date(row.createdAt), 'yyyy-MM-dd'),
    },
  ];

  const applicationTableData = analyticsData?.data?.recentApplications?.map((app: any) => ({
    id: app._id,
    jobId: app.jobId,
    jobTitle: app.job.title,
    candidateId: app.candidateId,
    candidateName: app.candidate.name,
    candidateEmail: app.candidate.email,
    interviewStatus: app.interviewstatus,
    hiringStatus: app.hiringStatus,
    createdAt: app.createdAt,
  })) || [];

  if (isLoading) {
    return (
      <WbLoader />
    );
  }

  const { jobsCount, applicationStats } = analyticsData.data;

  return (
    <div className="min-h-screen mt-5 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="col-span-4 grid grid-cols-4 gap-4">
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
              icon={Clipboard}
              value={applicationStats.hiredCount + applicationStats.rejectedCount + applicationStats.pendingCount}
              label="Total Interview Responses"
            />
            <StatCard icon={Clipboard} value={applicationStats.pendingCount} label="Pending Candidates" />
            <StatCard icon={Clipboard} value={applicationStats.hiredCount} label="Hired Candidates" />
            <StatCard icon={Clipboard} value={applicationStats.rejectedCount} label="Rejected Candidates" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Recent Job Posts</h3>
        <TableNex
          columns={[
            { accessor: 'id', header: 'Job ID' },
            {
              accessor: 'jobTitle',
              header: 'Job Title',
              render: (_: any, row: any) => <h3 className="font-semibold text-nowrap text-[17px]">{row.jobTitle}</h3>,
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
                          onClick={() => setEditingJobId(row.id)}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <Link
                          href={`/jobs/${row.id}`}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
                        >
                          <FileText className="h-4 w-4" />
                          View Job
                        </Link>
                        <Link
                          href={`/employer/dashboard/jobs/applications/${row.id}`}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
                        >
                          <Users className="h-4 w-4" />
                          View Applicants
                        </Link>
                        <button
                          onClick={() => setDeleteJobId(row.id)}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <CreateJob
                    jobToEdit={row}
                    isEditing={true}
                    open={editingJobId === row.id}
                    onOpenChange={(open) => !open && setEditingJobId(null)}
                    onSubmit={() => {
                      setEditingJobId(null);
                      queryClient.invalidateQueries({ queryKey: ['emp-jobs'] });
                    }}
                  />
                </div>
              ),
            },
          ]}
          styles={{ spacing: 'lg', rounded: 'lg' }}
          keyField={{ keyId: 'id', isVisible: false }}
          colorScheme={{
            ACCENT: 'var(--primary)',
            BORDER: 'var(--input)',
            PRIMARY: 'var(--background)',
            SECONDARY: '#F5F7F6',
          }}
          noDataMessage={isLoading ? (
            <div className="flex justify-center items-center h-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : 'No jobs found'}
          data={tableData || []}
        />

        <h3 className="text-lg font-semibold mb-2 mt-6">Recent Responses</h3>
        <TableNex
          columns={applicationColumns}
          styles={{ spacing: 'lg', rounded: 'lg' }}
          keyField={{ keyId: 'id', isVisible: false }}
          colorScheme={{
            ACCENT: 'var(--primary)',
            BORDER: 'var(--input)',
            PRIMARY: 'var(--background)',
            SECONDARY: '#F5F7F6',
          }}
          noDataMessage={isLoading ? (
            <div className="flex justify-center items-center h-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : 'No job applicants found'}
          data={applicationTableData}
        />

        <Dialog open={!!deleteJobId} onOpenChange={(open) => !open && setDeleteJobId(null)}>
          <DialogContent className='w-fit'>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>Are you sure you want to delete this job? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button
                className="px-4 py-2 bg-gray-200 rounded-md"
                onClick={() => setDeleteJobId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center gap-2"
                onClick={() => deleteMutation.mutate(deleteJobId!)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                )}
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}