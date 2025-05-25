import axios from 'axios';

export const getEmployerAnalytics = async () => {
  try {
    const response = await axios.get('/api/employer/analytics');
    return response.data;
  } catch (error) {
    throw error;
  }
};
