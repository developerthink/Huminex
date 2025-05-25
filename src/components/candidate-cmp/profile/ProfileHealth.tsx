'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { fetchProfileCompletion } from '@/lib/api-functions/home.api';



const ProfileHealth: React.FC = () => {
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profileCompletion'],
    queryFn: fetchProfileCompletion,
    initialData: { completionPercentage: 0, missingFields: [], isComplete: false },
  });

  const getStatusLabel = (percentage: number) => {
    if (percentage >= 80) return 'EXCELLENT';
    if (percentage >= 50) return 'AVERAGE';
    return 'LOW';
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500 bg-green-50';
    if (percentage >= 50) return 'text-red-500 bg-red-50';
    return 'text-orange-500 bg-orange-50';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Profile Health</h3>
        <span
          className={`text-sm font-medium px-2 py-1 rounded-md ${getStatusColor(
            profileData.completionPercentage
          )}`}
        >
          {profileLoading ? 'LOADING' : getStatusLabel(profileData.completionPercentage)}
        </span>
      </div>
      <Progress
        value={profileLoading ? 0 : profileData.completionPercentage}
        className="h-3 rounded-full"
      />
      <p className="text-sm text-gray-600 leading-relaxed">
        {profileLoading ? 'Loading...' : `${profileData.completionPercentage}% completed`}
      </p>
    </div>
  );
};

export default ProfileHealth;