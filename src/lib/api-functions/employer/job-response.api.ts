import axios from 'axios';

export const getJobResponses = async () => {
  try {
    const response = await axios.get('/api/employer/job-response');
    return response.data;
  } catch (error) {
    console.error('Error fetching job responses:', error);
    throw error;
  }
};

export const updateHiringStatus = async (applicationId: string, hiringStatus: 'PENDING' | 'HIRED' | 'REJECTED') => {
  try {
    const response = await axios.put(`/api/applications/status/${applicationId}`, {
      hiringStatus
    });
    return response.data;
  } catch (error) {
    console.error('Error updating hiring status:', error);
    throw error;
  }
};
