import axios, { AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import type { ApiResponse } from '@/types';
import { normalizeApiError } from '../../lib/errors';

// Enable request/response logging in development
const isDevelopment = process.env.NODE_ENV === 'development';

class ApiClient {
  private client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
  });

  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (isDevelopment) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }

        const token = this.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        return config;
      },
      (error: unknown) => {
        if (isDevelopment) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(normalizeApiError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (isDevelopment) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
      },
      async (error: AxiosError<unknown>) => {
        if (isDevelopment) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
        }
        
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        if (error.response?.status !== 401 || !originalRequest || !originalRequest.headers || originalRequest._retry) {
          return Promise.reject(normalizeApiError(error));
        }

        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          this.clearAuthAndRedirect();
          return Promise.reject(normalizeApiError(error));
        }

        originalRequest._retry = true;

        if (this.isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.client(originalRequest);
          });
        }

        this.isRefreshing = true;

        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          );

          const newToken = data.token || data.access_token;
          this.setTokens(newToken, data.refresh_token);
          this.processQueue(null, newToken);
          
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return this.client(originalRequest);
        } catch (refreshError) {
          const apiError = normalizeApiError(refreshError);
          this.processQueue(apiError, null);
          this.clearAuthAndRedirect();
          return Promise.reject(apiError);
        } finally {
          this.isRefreshing = false;
        }
      }
    );
  }

  private getAuthToken(): string | null {
    return Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  }

  private getRefreshToken(): string | null {
    return Cookies.get('refresh_token') || (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null);
  }

  private setTokens(accessToken: string, refreshToken?: string) {
    Cookies.set('token', accessToken, { sameSite: 'Lax' });
    localStorage.setItem('token', accessToken);
    
    if (refreshToken) {
      Cookies.set('refresh_token', refreshToken, { sameSite: 'Lax' });
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private processQueue(error: unknown, token: string | null) {
    this.failedQueue.forEach((p) => {
      if (error) {
        p.reject(error);
      } else {
        p.resolve(token!);
      }
    });
    this.failedQueue = [];
  }

  private clearAuthAndRedirect() {
    Cookies.remove('token');
    Cookies.remove('refresh_token');
    Cookies.remove('user');
    Cookies.remove('role');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
  }

  // Generic CRUD methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // File upload method
  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  }

  // Download method
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Raw axios instance for special cases
  get axios() {
    return this.client;
  }
}

const apiClient = new ApiClient();
export default apiClient;
