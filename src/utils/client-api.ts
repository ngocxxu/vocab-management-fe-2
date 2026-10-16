import type { AxiosRequestConfig } from 'axios';
import axiosInstance from '@/libs/axios';

export class ClientAPI {
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (!url || typeof url !== 'string') {
      throw new Error('URL must be a non-empty string');
    }
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  }

  static async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    if (!url || typeof url !== 'string') {
      throw new Error('URL must be a non-empty string');
    }
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  static async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    if (!url || typeof url !== 'string') {
      throw new Error('URL must be a non-empty string');
    }
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (!url || typeof url !== 'string') {
      throw new Error('URL must be a non-empty string');
    }
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  }

  static async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    if (!url || typeof url !== 'string') {
      throw new Error('URL must be a non-empty string');
    }
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  }
}
