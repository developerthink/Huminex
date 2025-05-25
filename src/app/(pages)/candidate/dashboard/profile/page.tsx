'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserData } from '@/types/user';
import UserHeader from '@/components/candidate-cmp/profile/UserHeader';
import SocialIconsBar from '@/components/candidate-cmp/profile/SocialIconsBar';
import UploadResume from '@/components/candidate-cmp/profile/UploadResume';
import ProfileHealth from '@/components/candidate-cmp/profile/ProfileHealth';
import NavTabs from '@/components/candidate-cmp/profile/NavTabs';
import { fetchUserData, updateUserProfile } from '@/lib/api-functions/home.api';
import { updateCandidateProfile } from '@/actions/profile.action';
import WbLoader from '@/components/global-cmp/wbLoader';


const UserProfilePage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery ({
    queryKey: ['userProfile'],
    queryFn: fetchUserData as unknown as () => Promise<UserData>,
  });
  const mutation = useMutation({
    mutationFn: updateCandidateProfile,
    onSuccess: (data) => {
      console.log("success",data);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile updated successfully.');
    },
    onError: (error:any) => {
      toast.error(error?.message   || 'Failed to update profile. Please try again.');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
  const handleSectionUpdate = async (
    section: 'educationDetails' | 'projects' | 'experience' | 'personalDetails',
    newData: any
  ) => {
    let payload: Partial<UserData>;
    if (section === 'personalDetails') {
      payload = { 
        state: newData.state, 
        skill: newData.skill,
        summary: newData.summary,
        tagline: newData.tagline
      };
    } else {
      payload = { [section]: newData };
    }

    mutation.mutate(payload as UserData);
  };

  if (isLoading) {
    return (
      <WbLoader/>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-lg">{error ? 'Failed to fetch user data' : 'Error loading user data.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <UserHeader 
            user={user as UserData} 
            onUpdateUser={async (data) => {
              return new Promise<void>((resolve, reject) => {
                mutation.mutate(data as UserData, {
                  onSuccess: () => resolve(),
                  onError: (error) => reject(error)
                });
              });
            }}
          />
          <NavTabs
            educationDetails={(user as UserData).educationDetails }
            projects={(user as UserData).projects || []}
            experience={(user as UserData).experience || []}
            personalDetails={{
              email: (user as UserData).email,
              state: (user as UserData).state,
              skill: (user as UserData).skill,
              summary: (user as UserData).summary,
              tagline: (user as UserData).tagline,
            }}
            onSectionUpdate={handleSectionUpdate}
            isSaving={mutation.isPending}
          />
        </div>

        {/* Swap SocialIconsBar and UploadResume for better layout */}
        <div className="lg:col-span-1 space-y-6">
          <UploadResume />
          <SocialIconsBar
            initialLinks={user.socialLinks}
            onUpdateUser={async (data) => {
              return new Promise<void>((resolve, reject) => {
                mutation.mutate(data as UserData, {
                  onSuccess: () => resolve(),
                  onError: (error) => reject(error)
                });
              });
            }}
          />
          <ProfileHealth />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;