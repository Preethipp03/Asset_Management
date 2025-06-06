
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.16.0.36:5000',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export default api;
