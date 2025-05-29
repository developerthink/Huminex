"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllJobs } from '@/lib/api-functions/cnadidate/jobs.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobCard from '@/components/job-card';
import Image from 'next/image';
import WbLoader from '@/components/global-cmp/wbLoader';
import { MdErrorOutline } from 'react-icons/md';

const JobsPage = () => {
  const [search, setSearch] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = () => {
    setSearchQuery(search);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['jobs', searchQuery],
    queryFn: () => fetchAllJobs(searchQuery)
  });


  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
          <p className="text-sm text-red-500 flex flex-col gap-2"><MdErrorOutline className='w-8 h-8' />{error?.message || 'Error loading jobs'}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className='p-8 rounded-xl bgGrad !text-white'>
        <h2 className='text-2xl'>Jobs</h2>
        <p className='opacity-80'>Find your next career opportunity</p>
      <div className="mt-4 flex gap-2">
              <Input
                type="text"
                placeholder="Search jobs by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-black"
              />
              <Button onClick={handleSearch} className="px-6">
                Search
              </Button>
            </div>
      </div>
      <br />
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="recommended">Recommended for You</TabsTrigger>
          <TabsTrigger value="invited">Invited Positions</TabsTrigger>
        </TabsList>

       {isLoading ? <WbLoader /> : <div className='bg-muted/30 rounded-xl p-4'>
        <TabsContent value="all">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">All Jobs</h2>
            <p className="text-gray-600">Browse all available positions</p>
          
          </div>
          <div className="space-y-4">
           <div className='grid grid-cols-2 gap-4 *:!bg-white'>
           {jobsData && jobsData?.allJobs.map((job: any) => (
              <JobCard key={job._id} job={job} />
            ))}
           </div>
            {jobsData && jobsData?.allJobs.length === 0 && (
              <div className="flex items-center justify-center flex-col">
              <Image src="/nodata.png" alt="No Data" width={200} height={200} />
              <p className="text-gray-500 text-center py-4">
                No jobs found.
              </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommended">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Recommended for You</h2>
            <p className="text-gray-600">Based on your skills and experience</p>
          </div>
          <div className="space-y-4">
           <div className='grid grid-cols-2 gap-4 *:!bg-white'>
            {jobsData && jobsData?.recommendedJobs.map((job: any) => (
              <JobCard key={job._id} job={job} />
            ))}
           </div>
            {jobsData && jobsData?.recommendedJobs.length === 0 && (
              <div className="flex items-center justify-center flex-col">
              <Image src="/nodata.png" alt="No Data" width={200} height={200} />
              <p className="text-gray-500 text-center py-4">
                No recommended jobs found. Update your skills to get personalized recommendations.
              </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invited">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Invited Positions</h2>
            <p className="text-gray-600">Jobs you've been invited to apply for</p>
          </div>
          <div className="space-y-4">
           <div className='grid grid-cols-2 gap-4 *:!bg-white'>
            {jobsData && jobsData?.invitedJobs.map((job: any) => (
              <JobCard key={job._id} job={job} />
            ))}
           </div>
            {jobsData && jobsData?.invitedJobs.length === 0 && (
              <div className="flex items-center justify-center flex-col">
                <Image src="/nodata.png" alt="No Data" width={200} height={200} />
                <p className="text-gray-500 text-center py-4">
                No invitations yet. Keep your profile updated to receive job invites.
              </p>
              </div>
            )}
          </div>
        </TabsContent>
        </div>}
      </Tabs>
    </div>
  );
};

export default JobsPage;