"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllJobs } from '@/lib/api-functions/cnadidate/jobs.api';
import { Button } from '@/components/ui/button';
import JobCard from '@/components/job-card';

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error loading jobs. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* All Jobs - Left Side */}
        <div className="col-span-12 lg:col-span-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">All Jobs</h2>
            <p className="text-gray-600">Browse all available positions</p>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Search jobs by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button 
                onClick={handleSearch}
                className="px-6"
              >
                Search
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {jobsData?.allJobs.map((job: any) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </div>

        {/* Right Side - Recommended and Invited */}
        <div className="col-span-12 lg:col-span-6 space-y-8">
          {/* Recommended Jobs */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Recommended for You</h2>
              <p className="text-gray-600">Based on your skills and experience</p>
            </div>
            <div className="space-y-4">
              {jobsData?.recommendedJobs.map((job: any) => (
                <JobCard key={job._id} job={job} />
              ))}
              {jobsData?.recommendedJobs.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recommended jobs found. Update your skills to get personalized recommendations.</p>
              )}
            </div>
          </div>

          {/* Invited Jobs */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Invited Positions</h2>
              <p className="text-gray-600">Jobs you've been invited to apply for</p>
            </div>
            <div className="space-y-4">
              {jobsData?.invitedJobs.map((job: any) => (
                <JobCard key={job._id} job={job} />
              ))}
              {jobsData?.invitedJobs.length === 0 && (
                <p className="text-gray-500 text-center py-4">No invitations yet. Keep your profile updated to receive job invites.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
