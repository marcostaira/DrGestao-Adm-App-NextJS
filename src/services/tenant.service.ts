/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/tenant.service.ts - Versão Estendida
import { ApiService } from "./api.service";

// Types estendidos
export interface ExtendedTenantData {
  client_name?: string;
  email: string;
  tel1?: string;
  friendly_name: string;
  active?: number;
  waactive?: number;
  // Campos estendidos do formulário
  client_doc_cnpj?: string;
  addr_cep?: string;
  addr_addr?: string;
  addr_uf?: string;
  addr_number?: string;
  addr_plus?: string;
  addr_area?: string;
  addr_city?: string;
  free_days?: number;
  // Campos do usuário principal (apenas para criação)
  userName?: string;
  userLogin?: string;
  userPassword?: string;
}

export interface ExtendedTenant {
  id: number;
  date_add: string;
  client_name: string;
  email: string;
  tel1: string;
  pacientes: number;
  usuarios: number;
  waactive: number;
  active: number;
  friendly_name?: string;
  patients_count?: number;
  users_count?: number;
  // Campos estendidos
  client_doc_cnpj?: string;
  addr_cep?: string;
  addr_addr?: string;
  addr_uf?: string;
  addr_number?: string;
  addr_plus?: string;
  addr_area?: string;
  addr_city?: string;
  free_days?: number;
}

export interface TenantsResponse {
  data: ExtendedTenant[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TenantUser {
  id: number;
  name: string;
  email: string;
  login: string;
  active: number;
  level: number;
  tenant_id: number;
  date_add: string;
  password?: string; // Para exibição apenas
}

export interface SubscriptionData {
  tenant_id: number;
  plan_id: number;
  start_date: string;
  end_date?: string;
  status: "active" | "inactive" | "suspended";
}

export interface Subscription {
  id: number;
  tenant_id: number;
  plan_id: number;
  start_date: string;
  end_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class TenantService {
  /**
   * Criar um novo tenant com dados estendidos
   */
  static async createTenant(tenantData: ExtendedTenantData): Promise<{
    success: boolean;
    data?: ExtendedTenant;
    message?: string;
    errors?: Record<string, string[]>;
  }> {
    try {
      const response = await ApiService.post<ExtendedTenant>(
        "/tenants",
        tenantData
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: "Tenant criado com sucesso",
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao criar tenant",
        errors: response.errors,
      };
    } catch (error) {
      console.error("Erro ao criar tenant:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Buscar o usuário principal de um tenant
   */
  static async getPrincipalUserByTenantId(tenantId: number): Promise<{
    success: boolean;
    data?: TenantUser;
    message?: string;
  }> {
    try {
      const response = await ApiService.get<TenantUser>(
        `/tenants/users/${tenantId}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || "Usuário principal não encontrado",
      };
    } catch (error) {
      console.error("Erro ao buscar usuário principal:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Buscar tenants com paginação e filtros
   */
  static async getTenants(
    page: number = 1,
    pageSize: number = 20,
    status?: number | null
  ): Promise<{
    success: boolean;
    data?: TenantsResponse;
    message?: string;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (status !== null && status !== undefined) {
        params.append("status", status.toString());
      }

      const response = await ApiService.get<TenantsResponse>(
        `/tenants?${params}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao carregar tenants",
      };
    } catch (error) {
      console.error("Erro ao buscar tenants:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Buscar todos os tenants (sem paginação)
   */
  static async getAllTenants(): Promise<{
    success: boolean;
    data?: ExtendedTenant[];
    message?: string;
  }> {
    try {
      const response = await ApiService.get<ExtendedTenant[]>("/tenants/all");

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao carregar tenants",
      };
    } catch (error) {
      console.error("Erro ao buscar todos os tenants:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Buscar tenant por ID com dados completos
   */
  static async getTenantById(id: number): Promise<{
    success: boolean;
    data?: ExtendedTenant;
    message?: string;
  }> {
    try {
      const response = await ApiService.get<ExtendedTenant>(`/tenants/${id}`);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || "Tenant não encontrado",
      };
    } catch (error) {
      console.error("Erro ao buscar tenant:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Atualizar tenant com dados estendidos
   */
  static async updateTenant(
    id: number,
    data: Partial<ExtendedTenantData>
  ): Promise<{
    success: boolean;
    data?: ExtendedTenant;
    message?: string;
    errors?: Record<string, string[]>;
  }> {
    try {
      const response = await ApiService.put<ExtendedTenant>(
        `/tenants/${id}`,
        data
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: "Tenant atualizado com sucesso",
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao atualizar tenant",
        errors: response.errors,
      };
    } catch (error) {
      console.error("Erro ao atualizar tenant:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Buscar usuários de um tenant
   */
  static async getUsersByTenant(tenantId: number): Promise<{
    success: boolean;
    data?: TenantUser[];
    message?: string;
  }> {
    try {
      const response = await ApiService.get<TenantUser[]>(
        `/tenants/users/${tenantId}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao carregar usuários",
      };
    } catch (error) {
      console.error("Erro ao buscar usuários do tenant:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Atualizar status de um usuário
   */
  static async updateUserStatus(
    userId: number,
    data: { active: number }
  ): Promise<{
    success: boolean;
    data?: TenantUser;
    message?: string;
  }> {
    try {
      const response = await ApiService.put<TenantUser>(
        `/tenants/users/${userId}`,
        data
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: "Status do usuário atualizado com sucesso",
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao atualizar status do usuário",
      };
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Criar assinatura
   */
  static async createSubscription(data: SubscriptionData): Promise<{
    success: boolean;
    data?: Subscription;
    message?: string;
    errors?: Record<string, string[]>;
  }> {
    try {
      const response = await ApiService.post<Subscription>(
        "/subscription",
        data
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: "Assinatura criada com sucesso",
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao criar assinatura",
        errors: response.errors,
      };
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Buscar assinaturas
   */
  static async getSubscriptions(): Promise<{
    success: boolean;
    data?: Subscription[];
    message?: string;
  }> {
    try {
      const response = await ApiService.get<Subscription[]>("/subscription");

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao carregar assinaturas",
      };
    } catch (error) {
      console.error("Erro ao buscar assinaturas:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Buscar assinatura por tenant ID
   */
  static async getSubscriptionByTenantId(tenantId: number): Promise<{
    success: boolean;
    data?: Subscription;
    message?: string;
  }> {
    try {
      const response = await ApiService.get<Subscription>(
        `/subscription/tenant/${tenantId}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || "Assinatura não encontrada",
      };
    } catch (error) {
      console.error("Erro ao buscar assinatura do tenant:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Cancelar assinatura
   */
  static async cancelSubscription(subscriptionId: number): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await ApiService.put<any>(
        `/subscription/${subscriptionId}/cancel`,
        {}
      );

      if (response.success) {
        return {
          success: true,
          message: "Assinatura cancelada com sucesso",
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao cancelar assinatura",
      };
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Reativar assinatura
   */
  static async reactivateSubscription(subscriptionId: number): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await ApiService.put<any>(
        `/subscription/${subscriptionId}/reactivate`,
        {}
      );

      if (response.success) {
        return {
          success: true,
          message: "Assinatura reativada com sucesso",
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao reativar assinatura",
      };
    } catch (error) {
      console.error("Erro ao reativar assinatura:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  // Adicione estes métodos ao seu src/services/tenant.service.ts

  /**
   * Buscar templates de um tenant - igual ao Angular
   */
  static async getTemplatesByTenant(tenantId: number): Promise<{
    success: boolean;
    data?: any[];
    message?: string;
  }> {
    try {
      // Usando exatamente a mesma URL do Angular: `${this.apiUrl}/${tenantId}`
      const response = await ApiService.get<any[]>(`/templates/${tenantId}`);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao carregar templates",
      };
    } catch (error) {
      console.error("Erro ao buscar templates do tenant:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Atualizar template - igual ao Angular
   */
  static async updateTemplate(
    templateId: number,
    data: { content: string }
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      // Usando exatamente a mesma URL do Angular: `${this.apiUrl}/${templateId}`
      const response = await ApiService.put<any>(
        `/templates/${templateId}`,
        data
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: "Template atualizado com sucesso",
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao atualizar template",
      };
    } catch (error) {
      console.error("Erro ao atualizar template:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }
}
