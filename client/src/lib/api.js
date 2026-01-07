import axios from 'axios';

// Get the base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("VITE_API_BASE_URL is not set. Please check your .env file.");
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a server error and get the message
    const message = error.response?.data?.message || error.message;
    
    // You could also check for 401 Unauthorized and log the user out
    // if (error.response.status === 401) {
    //   window.location.href = '/login';
    // }

    return Promise.reject(new Error(message));
  }
);

export default api;