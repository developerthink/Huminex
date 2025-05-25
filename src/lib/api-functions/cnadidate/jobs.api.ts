import axios from 'axios';
import type { JobType } from '@/types/models/job';

export interface JobsResponse {
  allJobs: JobType[];
  recommendedJobs: JobType[];
  invitedJobs: JobType[];
}

export const fetchAllJobs = async (search?: string): Promise<JobsResponse> => {
  const response = await axios.get('/api/job', {
    params: search ? { search } : undefined
  });
  return response.data.data;
};
