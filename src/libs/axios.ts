import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { API_ENDPOINTS } from '@/utils/api-config';
import { handleTokenExpiration } from '@/utils/auth-utils';
import { Env } from './Env';

// Create axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: Env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add Better Stack headers if the URL matches Better Stack endpoint
    if (config.url && Env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST
      && config.url.includes(Env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST)) {
      config.headers.set('Authorization', `Bearer ${Env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN}`);
    }

    // Add any other common headers or authentication tokens here
    if (config.headers && !config.headers.Authorization) {
      // You can add default authorization headers here if needed
      // config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚀 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('✅ Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 or 403 Unauthorized - token expired
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const refreshResponse = await fetch(`${Env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${API_ENDPOINTS.auth.refresh}`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();

          // Update the original request with new token
          if (refreshData.accessToken || refreshData.token) {
            // Retry the original request
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Handle token expiration with toast notification
        handleTokenExpiration();
      }
    }

    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      console.error('❌ Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ Network Error:', error.message);
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }

    return Promise.reject(error);
  },
);

// Export the configured axios instance
export default axiosInstance;

// Export axios types for convenience
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse };
