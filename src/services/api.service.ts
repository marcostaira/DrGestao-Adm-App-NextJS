/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from '@/types/user.types';

export class ApiService {
  private static readonly baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  private static readonly timeout = parseInt(process.env.API_TIMEOUT || '30000');

  /**
   * Executa requisição HTTP com configurações de segurança
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const token = this.getAuthToken();
      
      console.log(`🌐 API Request: ${options.method || 'GET'} ${this.baseURL}${endpoint}`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        return {
          success: false,
          message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
          errors: errorData.errors || {}
        };
      }

      const data = await response.json();
      console.log('✅ API Success:', data);
      
      return {
        success: true,
        data,
        message: data.message
      };

    } catch (error) {
      clearTimeout(timeoutId);
      console.error('💥 API Exception:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            message: 'Tempo limite da requisição excedido'
          };
        }
        
        return {
          success: false,
          message: error.message || 'Erro de conexão com a API'
        };
      }

      return {
        success: false,
        message: 'Erro desconhecido na comunicação com a API'
      };
    }
  }

  /**
   * GET request
   */
  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  static async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  static async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Obtém token de autenticação do localStorage
   */
  private static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  /**
   * Define token de autenticação no localStorage
   */
  static setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  }

  /**
   * Remove token de autenticação do localStorage
   */
  static removeAuthToken(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Erro ao remover token:', error);
    }
  }
}