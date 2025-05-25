import { Job } from "@/app/(pages)/jobs/[id]/page";
import { UserData } from "@/types/user";
import axios from "axios";

 export type ApplicationsResponse = {
    data: {
      applications: ApiApplication[];
    };
  };
  
  // Types
  export type Application = {
    jobId: string;
    title: string;
    company: string;
    logo: string;
    location: string;
    jobType: string;
    status: string;
    appliedDate: string;
    [key: string]: any;
  };
  
  export type ApiApplication = {
    job: {
      _id: string;
      title: string;
      employer: {
        companyDetails: {
          name: string;
          logo: string;
        };
      };
      location: string;
      jobType: string;
    };
    interviewstatus: string;
    hiringStatus: string;
    createdAt: string;
  };
  
  
export const fetchApplications = async (status: string): Promise<Application[]> => {
  const endpoint = status === 'all' 
    ? '/api/applications/user' 
    : `/api/applications/user?status=${status.toUpperCase()}`;
  
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch applications: ${response.statusText}`);
  }
  
  const responseData: ApplicationsResponse = await response.json();
  const appData = responseData.data.applications || [];

  return appData.map((application) => ({
    jobId: application.job._id,
    title: application.job.title,
    company: application.job.employer.companyDetails.name,
    logo: application.job.employer.companyDetails.logo,
    location: application.job.location,
    jobType: application.job.jobType,
    status: application.interviewstatus || 'PENDING',
    hiringStatus: application.hiringStatus || 'PENDING',
    appliedDate: new Date(application.createdAt).toLocaleDateString(),
  }));
};



export const fetchProfileCompletion = async () => {
    const response = await axios.get('/api/candidate/profile-completion');
    return response.data.data;
  };

  export const fetchUserData = async ({id}: {id?: string}):Promise<UserData> => {
    const response = id ? await axios.get(`/api/user/${id}`) : await axios.get('/api/user');
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.data;
  };
  
  export const updateUserProfile = async (payload:UserData) => {
    const response = await axios.put('/api/candidate/profile', payload);
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.data;
  };

  export const fetchJobDetails = async ({id}: {id?: string}):Promise<Job> => {
    const response = await axios.get(`/api/job/${id}`);
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.data;
  };
  