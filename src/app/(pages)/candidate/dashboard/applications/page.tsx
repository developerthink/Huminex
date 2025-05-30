'use client';
import React from 'react';
import TableNex from 'react-tablenex';
import 'react-tablenex/style.css';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { fetchApplications } from '@/lib/api-functions/home.api';
import WbLoader from '@/components/global-cmp/wbLoader';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export type ApplicationType = {
  jobId: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  jobType: string;
  status: string;
  appliedDate: string;
  hiringStatus: string;
  applicationId: string;
  [key: string]: any;
};

const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('all');

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['applications', activeTab],
    queryFn: () => fetchApplications(activeTab),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Garbage collection after 10 minutes
  });

  const columns = [
    {
      header: 'ID',
      accessor: 'jobId',
      hidden: true,
    },
    {
      header: 'Company',
      accessor: 'company',
      render: (_: any, row: any) => (
        <Link href={`/jobs/${row.jobId}`} target="_blank">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <Image
                src={row.logo || '/default-company-logo.png'}
                alt={row.company}
                fill
                className="rounded-md object-cover"
              />
            </div>
            <span>{row.company}</span>
          </div>
        </Link>
      ),
    },
    {
      header: 'Job Title',
      accessor: 'title',
      render: (_: any, row: any) => row.title.charAt(0).toUpperCase() + row.title.slice(1),
    },
    {
      header: 'Work type',
      accessor: 'location',
      render: (_: any, row: any) => row.location.charAt(0).toUpperCase() + row.location.slice(1),
    },
    {
      header: 'Job Type',
      accessor: 'jobType',
      render: (_: any, row: any) => row.jobType.charAt(0).toUpperCase() + row.jobType.slice(1),
    },
    {
      header: 'Hiring Status',
      accessor: 'hiringStatus',
      render: (_: any, row: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.hiringStatus === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : row.hiringStatus === 'HIRED'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.hiringStatus.charAt(0).toUpperCase() + row.hiringStatus.slice(1)}
        </span>
      ),
    },
    {
      header: 'Interview Analytics',
      accessor: 'interviewAnalytics',
      render: (_: any, row: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(
              row.status === 'PENDING'
                ? `/interview/${row.applicationId}`
                : `/interview/${row.applicationId}/analytics`
            )
          }
        >
          {row.status === 'PENDING' ? 'Give Interview' : 'View Analytics'}
        </Button>
      ),
    },
    {
      header: 'Applied Date',
      accessor: 'appliedDate',
      render: (_: any, row: any) => row.appliedDate.charAt(0).toUpperCase() + row.appliedDate.slice(1),
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className='p-6 rounded-xl bgGrad !text-white'>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-sm ">Track all your job applications here</p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="hired">Hired</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {isLoading ? <WbLoader /> : (
          <TabsContent value={activeTab} className="w-full">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-gray-600">Loading applications...</p>
              </div>
            ) : applications && applications?.length > 0 ? (
              <TableNex 
                data={applications || []}
                noDataMessage={
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ClipboardList className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No recent applications</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Your scheduled applications will appear here
                    </p>
                  </div>
                } 
                keyField={{ keyId: "jobId", isVisible: false }} 
                responsive={true} 
                columns={columns} 
                colorScheme={{
                  ACCENT: "var(--primary)",
                }}
              />
            ) : (
              <div className="flex justify-center items-center py-12 text-center">
                <div>
                  <Image src="/no-jobs.png" alt="No applications found" width={300} height={300} />
                  <p className="text-gray-400 text-sm mt-1">
                    No {activeTab !== 'all' ? activeTab : ''} applications to display
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Page;