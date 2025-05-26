'use client'

import React from 'react'
import TableNex from 'react-tablenex'
import "react-tablenex/style.css";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getApplicationsByJobId } from '@/lib/api-functions/employer/job-applications.api';
import { updateHiringStatus } from '@/lib/api-functions/employer/job-response.api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import WbLoader from '@/components/global-cmp/wbLoader';
import { toast } from 'sonner';

type HiringStatus = 'PENDING' | 'HIRED' | 'REJECTED';

type TableData = Record<string, any>;

const JobDetailsPage = () => {
  const params = useParams();
  const jobId = params.jobId as string;
  const queryClient = useQueryClient();

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['jobApplications', jobId],
    queryFn: () => getApplicationsByJobId(jobId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: HiringStatus }) =>
      updateHiringStatus(applicationId, status),
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['jobApplications', jobId] });
    },
  });

  const handleStatusChange = (applicationId: string, status: HiringStatus) => {
    updateStatusMutation.mutate({ applicationId, status });
  };

  const formatData = (data: any[]): TableData[] => {
    return data.map(item => ({
      applicationId: item._id,
      'Candidate Name': item.candidateId.name,
      'Candidate Email': item.candidateId.email,
      'Application Date': format(new Date(item.createdAt), 'yyyy-MM-dd'),
      'Interview Status': item.interviewStatus || 'Not Started',
      'Status': (
        <Select
          defaultValue={item.status || 'PENDING'}
          onValueChange={(value: HiringStatus) => handleStatusChange(item._id, value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="HIRED">Hired</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      ),
    }));
  };

  const tableData = applicationsData?.data ? formatData(applicationsData.data) : [];

  if (!applicationsData?.data?.length) {
    return <div className="flex items-center justify-center h-96">No applications found for this job</div>;
  }

  return (
    <div className="mt-5 ">
      <div className="flex flex-col w-full gap-2 p-8 bgGrad text-white rounded-xl">
        <h1 className="text-2xl font-bold">All applicants for selected Job</h1>
        <p className="text-sm ">Manage all applicants for Job</p>
      </div>
      <br/>
      <div className="">
        <TableNex
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
          noDataMessage={isLoading ? <WbLoader /> : "No applications found for this job"}
          data={tableData || []}
        />
      </div>
    </div>
  )
}

export default JobDetailsPage