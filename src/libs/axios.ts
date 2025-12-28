import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { API_ENDPOINTS } from '@/utils/api-config';
import { handleTokenExpiration } from '@/utils/auth-utils';
import { Env } from './Env';
import { logger } from './Logger';

// Create axios instance with default configuration
// Use relative paths to call Next.js API routes instead of backend directly
const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
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

    if (process.env.NODE_ENV === 'development') {
      logger.debug('Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    logger.error('Request Error:', { error });
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 403 Forbidden - redirect to login
    if (error.response?.status === 403) {
      handleTokenExpiration();
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - token expired
    if ((error.response?.status === 401) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token via Next.js API route
        const refreshResponse = await fetch(`/api${API_ENDPOINTS.auth.refresh}`, {
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
        logger.error('Token refresh failed:', { error: refreshError });
        handleTokenExpiration();
      }
    }

    if (error.response) {
      const errorInfo: Record<string, unknown> = {};
      if (error.response.status !== undefined) {
        errorInfo.status = error.response.status;
      }
      if (error.response.statusText) {
        errorInfo.statusText = error.response.statusText;
      }
      if (error.config?.url) {
        errorInfo.url = error.config.url;
      }
      if (error.response.data !== undefined) {
        errorInfo.data = error.response.data;
      }

      if (Object.keys(errorInfo).length > 0) {
        logger.error('Response Error:', errorInfo);
      } else {
        logger.error('Response Error (empty response):', {
          hasResponse: !!error.response,
          hasRequest: !!error.request,
          message: error.message,
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
      }
    } else if (error.request) {
      logger.error('Network Error:', { message: error.message || error });
    } else {
      logger.error('Error:', { message: error.message || error });
    }

    return Promise.reject(error);
  },
);

// Export the configured axios instance
export default axiosInstance;

// Export axios types for convenience
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse };
