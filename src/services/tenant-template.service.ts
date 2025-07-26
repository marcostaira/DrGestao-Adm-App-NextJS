/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/tenant-template.service.ts
import { ApiService } from "./api.service";

export interface TenantTemplate {
  id: number;
  type: string;
  content: string;
  active: boolean;
  tenant_id: number;
  client_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateTemplateData {
  content: string;
  active?: boolean;
}

export class TenantTemplateService {
  /**
   * Buscar templates de um tenant específico
   */
  static async getTemplatesByTenant(tenantId: number): Promise<{
    success: boolean;
    data?: TenantTemplate[];
    message?: string;
  }> {
    try {
      const response = await ApiService.get<TenantTemplate[]>(
        `/tenants/${tenantId}/templates`
      );

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
   * Atualizar template específico
   */
  static async updateTemplate(
    templateId: number,
    data: UpdateTemplateData
  ): Promise<{
    success: boolean;
    data?: TenantTemplate;
    message?: string;
  }> {
    try {
      const response = await ApiService.put<TenantTemplate>(
        `/templates/${templateId}`,
        data
      );

      if (response.success && response.data) {
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

  /**
   * Criar novo template para um tenant
   */
  static async createTemplate(
    tenantId: number,
    data: {
      type: string;
      content: string;
      active?: boolean;
    }
  ): Promise<{
    success: boolean;
    data?: TenantTemplate;
    message?: string;
  }> {
    try {
      const response = await ApiService.post<TenantTemplate>(
        `/tenants/${tenantId}/templates`,
        {
          ...data,
          active: data.active ?? true,
        }
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: "Template criado com sucesso",
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao criar template",
      };
    } catch (error) {
      console.error("Erro ao criar template:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Deletar template
   */
  static async deleteTemplate(templateId: number): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await ApiService.delete<any>(`/templates/${templateId}`);

      if (response.success) {
        return {
          success: true,
          message: "Template removido com sucesso",
        };
      }

      return {
        success: false,
        message: response.message || "Erro ao remover template",
      };
    } catch (error) {
      console.error("Erro ao remover template:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Obter variáveis disponíveis para templates
   */
  static getAvailableVariables(): Array<{ name: string; description: string }> {
    return [
      { name: "nome_clinica", description: "Nome da clínica" },
      { name: "nome_paciente", description: "Nome do paciente" },
      { name: "data", description: "Data do agendamento" },
      { name: "hora", description: "Hora do agendamento" },
      { name: "tel_clinica", description: "Telefone da clínica" },
      {
        name: "primeiro_nome_profissional",
        description: "Primeiro nome do profissional",
      },
      {
        name: "nome_profissional",
        description: "Nome completo do profissional",
      },
    ];
  }

  /**
   * Validar variáveis no conteúdo do template
   */
  static validateTemplateVariables(content: string): {
    isValid: boolean;
    invalidVariables: string[];
    validVariables: string[];
  } {
    const validVariables = this.getAvailableVariables().map((v) => v.name);
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const foundVariables: string[] = [];
    let match;

    while ((match = variablePattern.exec(content)) !== null) {
      foundVariables.push(match[1].trim());
    }

    const validFound = foundVariables.filter((v) => validVariables.includes(v));
    const invalidFound = foundVariables.filter(
      (v) => !validVariables.includes(v)
    );

    return {
      isValid: invalidFound.length === 0,
      invalidVariables: [...new Set(invalidFound)],
      validVariables: [...new Set(validFound)],
    };
  }

  /**
   * Formatar tipo de template para exibição
   */
  static formatTemplateType(type: string): string {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
}
