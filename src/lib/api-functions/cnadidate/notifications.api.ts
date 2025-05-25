import axios from "axios";


export const fetchNotifications = async () => {
    const response = await axios.get('/api/notification');
  return response.data.data;
};