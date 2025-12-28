import type { AxiosRequestConfig } from 'axios';
import type { TAuthResponse, TOAuthSyncResponse } from '@/types/auth';
import axiosInstance from '@/libs/axios';
import { API_METHODS } from './api-config';

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

export const authApi = {
  signin: (data: { email: string; password: string }) => {
    const config = API_METHODS.auth.signin(data);
    return ClientAPI.post<TAuthResponse>(config.endpoint, config.data);
  },
  signup: (data: { email: string; password: string; firstName: string; lastName: string; phone: string; avatar: string; role: string }) => {
    const config = API_METHODS.auth.signup(data);
    return ClientAPI.post<TAuthResponse>(config.endpoint, config.data);
  },
  oauthSync: (data: { accessToken: string }) => {
    const config = API_METHODS.auth.oauthSync(data);
    return ClientAPI.post<TOAuthSyncResponse>(config.endpoint, config.data);
  },
};
