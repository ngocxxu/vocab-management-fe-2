import type { AxiosRequestConfig } from 'axios';
import axiosInstance from '@/libs/axios';

// Generic API client with common methods
export class ApiClient {
  // GET request
  static async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  }

  // POST request
  static async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  // PUT request
  static async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  // DELETE request
  static async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  }

  // PATCH request
  static async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  }
}

// Example usage functions for common API patterns
export const api = {
  // Example: Get user data
  getUser: (userId: string) => ApiClient.get(`/api/users/${userId}`),

  // Example: Create a new user
  createUser: (userData: any) => ApiClient.post('/api/users', userData),

  // Example: Update user data
  updateUser: (userId: string, userData: any) => ApiClient.put(`/api/users/${userId}`, userData),

  // Example: Delete user
  deleteUser: (userId: string) => ApiClient.delete(`/api/users/${userId}`),

  // Example: Search with query parameters
  searchUsers: (query: string) => ApiClient.get('/api/users/search', {
    params: { q: query },
  }),
};

// Export the axios instance for direct use when needed
export { default as axios } from '@/libs/axios';
