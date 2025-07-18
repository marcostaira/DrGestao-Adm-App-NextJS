import { ApiService } from './api.service';
import { ApiResponse } from '@/types/user.types';

// Tipos baseados na tabela gas_admusr
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  login: string;
  active: number; // 0 = inativo, 1 = ativo
  level: number;  // 1 = super admin, 2 = admin, 3 = operator, 4 = user
}

export interface CreateAdminUserData {
  name: string;
  email: string;
  login: string;
  pwd: string;
  active: number;
  level: number;
}

export interface UpdateAdminUserData {
  name?: string;
  email?: string;
  login?: string;
  pwd?: string;
  active?: number;
  level?: number;
}

export class AdminUsersService {
  private static readonly baseUrl = '/admins';

  /**
   * Buscar todos os usuários administrativos
   */
  static async getAllUsers(): Promise<ApiResponse<AdminUser[]>> {
    try {
      console.log('🔍 Buscando todos os usuários administrativos...');
      return await ApiService.get<AdminUser[]>(this.baseUrl);
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return {
        success: false,
        message: 'Erro ao carregar usuários'
      };
    }
  }

  /**
   * Buscar usuário por ID
   */
  static async getUserById(id: number): Promise<ApiResponse<AdminUser>> {
    try {
      console.log(`🔍 Buscando usuário ID: ${id}`);
      return await ApiService.get<AdminUser>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      return {
        success: false,
        message: 'Erro ao carregar usuário'
      };
    }
  }

  /**
   * Criar novo usuário
   */
  static async createUser(userData: CreateAdminUserData): Promise<ApiResponse<AdminUser>> {
    try {
      console.log('➕ Criando novo usuário:', { ...userData, pwd: '[HIDDEN]' });
      return await ApiService.post<AdminUser>(this.baseUrl, userData);
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return {
        success: false,
        message: 'Erro ao criar usuário'
      };
    }
  }

  /**
   * Atualizar usuário existente
   */
  static async updateUser(id: number, userData: UpdateAdminUserData): Promise<ApiResponse<AdminUser>> {
    try {
      console.log(`✏️ Atualizando usuário ID: ${id}`, { ...userData, pwd: userData.pwd ? '[HIDDEN]' : undefined });
      return await ApiService.put<AdminUser>(`${this.baseUrl}/${id}`, userData);
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      return {
        success: false,
        message: 'Erro ao atualizar usuário'
      };
    }
  }

  /**
   * Deletar usuário
   */
  static async deleteUser(id: number): Promise<ApiResponse<void>> {
    try {
      console.log(`🗑️ Deletando usuário ID: ${id}`);
      return await ApiService.delete<void>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      return {
        success: false,
        message: 'Erro ao deletar usuário'
      };
    }
  }

  /**
   * Utilitários para formatação
   */
  static getLevelLabel(level: number): string {
    const labels: Record<number, string> = {
      1: 'Super Administrador',
      2: 'Administrador', 
      3: 'Operador',
      4: 'Usuário'
    };
    return labels[level] || 'Usuário';
  }

  static getStatusLabel(active: number): string {
    return active === 1 ? 'Ativo' : 'Inativo';
  }

  static getStatusColor(active: number): string {
    return active === 1 ? 'text-green-600' : 'text-red-500';
  }
}