'use client'

import React from 'react'
import TableNex from 'react-tablenex'
import "react-tablenex/style.css";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getJobResponses, updateHiringStatus } from '@/lib/api-functions/employer/job-response.api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import WbLoader from '@/components/global-cmp/wbLoader';

type HiringStatus = 'PENDING' | 'HIRED' | 'REJECTED';

type TableData = Record<string, any>;

const JobResponsePage = () => {
  const queryClient = useQueryClient();

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['jobResponses'],
    queryFn: getJobResponses,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: HiringStatus }) =>
      updateHiringStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobResponses'] });
    },
  });

  const handleStatusChange = (applicationId: string, status: HiringStatus) => {
    updateStatusMutation.mutate({ applicationId, status });
  };

  const formatData = (data: any[]): TableData[] => {
    return data.map(item => ({
      applicationId: item._id,
      'candidate Name': item.candidate.name,
      'candidate Email': item.candidate.email,
      jobId: item.job._id,
      'job Title': item.job.title,
      'application Date': format(new Date(item.createdAt), 'yyyy-MM-dd'),
      'interview Status': item.interviewstatus,
      'hiring Status': (
        <Select
          defaultValue={item.hiringStatus}
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
      'communication': item.communication,
      'difficulty Level': item.job.interviewSettings?.difficultyLevel || 'medium',
    }));
  };

  const tableData = responseData?.data ? formatData(responseData.data) : [];

  if (isLoading) {
    return <WbLoader />;
  }

  if (!responseData?.data?.length) {
    return <div className="flex items-center justify-center h-96">No job responses found</div>;
  }

  return (
    <div className="mt-5">
     <div className="flex flex-col w-full gap-2 p-8 bgGrad text-white rounded-xl">
        <h1 className="text-2xl font-bold">All Applicants</h1>
        <p className="text-sm ">Manage all applicants here</p>
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
          data={tableData}
        />
      </div>
    </div>
  )
}

export default JobResponsePage