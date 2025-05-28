'use client'

import React from 'react'
import TableNex from 'react-tablenex'
import "react-tablenex/style.css";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getJobResponses, updateHiringStatus } from '@/lib/api-functions/employer/job-response.api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import WbLoader from '@/components/global-cmp/wbLoader';
import { toast } from 'sonner';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { MoreHorizontal, BarChart, User, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type HiringStatus = 'PENDING' | 'HIRED' | 'REJECTED';

type TableData = Record<string, any>;

const JobResponsePage = () => {
  const queryClient = useQueryClient();

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['jobResponses'],
    queryFn: getJobResponses,
  });

  console.log("job response", responseData)

  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: HiringStatus }) =>
      updateHiringStatus(applicationId, status),
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['jobResponses'] });
      queryClient.invalidateQueries({ queryKey: ['employerAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['employerAnalytics'] });
    },
    onError: (error: any) => {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    },
  });

  const handleStatusChange = (applicationId: string, status: HiringStatus) => {
    updateStatusMutation.mutate({ applicationId, status });
  };

  const columns = [
    { accessor: 'applicationId', header: 'Application ID', isVisible: false },
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
          <Link href={`/interview/${row.applicationId}/analytics`}>
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
          className={`text-nowrap rounded-full px-2 py-0.5 text-sm uppercase ${
            row.interviewStatus === 'PENDING'
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
          {updateStatusMutation.isPending && updateStatusMutation.variables?.applicationId === row.applicationId ? (
            <div className="flex justify-center items-center w-32 h-10">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-600"></div>
            </div>
          ) : (
            <Select
              value={row.hiringStatus}
              onValueChange={(value: HiringStatus) => handleStatusChange(row.applicationId, value)}
            >
              <SelectTrigger
                className={`!border-none !outline-none !select-none !px-4 ${
                  row.hiringStatus === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-700'
                    : row.hiringStatus === 'HIRED'
                    ? 'bg-green-100 text-green-700 border-green-700'
                    : 'bg-red-100 text-red-700 border-red-700'
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="HIRED">Hired</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
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
                    href={`/interview/${row.applicationId}/analytics`}
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
      accessor: 'applicationDate',
      header: 'Applied On',
      render: (_: any, row: any) => format(new Date(row.applicationDate), 'yyyy-MM-dd'),
    },
  ];

  const formatData = (data: any[]): TableData[] => {
    return data.map(item => ({
      applicationId: item._id,
      jobId: item.job._id,
      jobTitle: item.job.title,
      candidateId: item.candidate._id,
      candidateName: item.candidate.name,
      candidateEmail: item.candidate.email,
      interviewStatus: item.interviewstatus || 'PENDING',
      hiringStatus: item.hiringStatus || 'PENDING',
      applicationDate: item.createdAt,
    }));
  };

  const tableData = responseData?.data ? formatData(responseData.data) : [];

  return (
    <div className="mt-5">
      <div className="flex flex-col w-full gap-2 p-8 bgGrad text-white rounded-xl">
        <h1 className="text-2xl font-bold">All Applicants</h1>
        <p className="text-sm">Manage all applicants here</p>
      </div>
      <br />
      <div className="">
        <TableNex
          columns={columns}
          styles={{
            spacing: "lg",
            rounded: "lg",
          }}
          keyField={{
            keyId: "applicationId",
            isVisible: false,
          }}
          colorScheme={{
            ACCENT: "var(--primary)",
            BORDER: "var(--input)",
            PRIMARY: "var(--background)",
            SECONDARY: "#F5F7F6",
          }}
          noDataMessage={isLoading ? <WbLoader /> : "No job applicants found"}
          data={tableData || []}
        />
      </div>
    </div>
  );
};

export default JobResponsePage;