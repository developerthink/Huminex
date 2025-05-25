import axios from 'axios';

export const getApplicationsByJobId = async (jobId: string) => {
  const response = await axios.get(`/api/applications/${jobId}`);
  return response.data;
};