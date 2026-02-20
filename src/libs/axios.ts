import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { API_ENDPOINTS } from '@/utils/api-config';
import { getIsSigningOut, handleTokenExpiration } from '@/utils/auth-utils';
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

    if (getIsSigningOut()) {
      throw error;
    }

    if (error.response?.status === 403) {
      handleTokenExpiration();
      throw error;
    }

    if ((error.response?.status === 401) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
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
      const status = error.response.status;
      const errorInfo: Record<string, unknown> = {};
      if (status !== undefined) {
        errorInfo.status = status;
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

      const isClientError = status >= 400 && status < 500;
      const logMethod = isClientError ? logger.warn : logger.error;
      const logLabel = isClientError ? 'Response Warning:' : 'Response Error:';

      if (Object.keys(errorInfo).length > 0) {
        logMethod(logLabel, errorInfo);
      } else {
        logMethod(`${logLabel} (empty response)`, {
          hasResponse: !!error.response,
          hasRequest: !!error.request,
          message: error.message,
          url: error.config?.url,
          status,
          statusText: error.response?.statusText,
        });
      }
    } else if (error.request) {
      logger.error('Network Error:', { message: error.message || error });
    } else {
      logger.error('Error:', { message: error.message || error });
    }

    throw error;
  },
);

// Export the configured axios instance
export default axiosInstance;

// Export axios types for convenience
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
