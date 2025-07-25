/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiService } from "./api.service";
import { ApiResponse } from "@/types/user.types";

export type ParamType = "admin" | "system";

export interface ParamData {
  [key: string]: any;
}

export class AppParamsService {
  /**
   * Obter parâmetros administrativos
   */
  static async getAdminParams(): Promise<ApiResponse<ParamData>> {
    try {
      console.log("📋 Carregando parâmetros administrativos...");
      return await ApiService.get<ParamData>("/settings");
    } catch (error) {
      console.error("❌ Erro ao carregar parâmetros administrativos:", error);
      return {
        success: false,
        message: "Erro ao carregar parâmetros administrativos",
      };
    }
  }

  /**
   * Atualizar parâmetros administrativos
   */
  static async updateAdminParams(
    data: ParamData
  ): Promise<ApiResponse<ParamData>> {
    try {
      console.log("💾 Salvando parâmetros administrativos...");
      return await ApiService.post<ParamData>("/settings", data);
    } catch (error) {
      console.error("❌ Erro ao salvar parâmetros administrativos:", error);
      return {
        success: false,
        message: "Erro ao salvar parâmetros administrativos",
      };
    }
  }

  /**
   * Obter parâmetros do sistema DrGestão
   */
  static async getSystemParams(): Promise<ApiResponse<ParamData>> {
    try {
      console.log("📋 Carregando parâmetros do sistema...");
      return await ApiService.get<ParamData>("/appsettings");
    } catch (error) {
      console.error("❌ Erro ao carregar parâmetros do sistema:", error);
      return {
        success: false,
        message: "Erro ao carregar parâmetros do sistema",
      };
    }
  }

  /**
   * Atualizar parâmetros do sistema DrGestão
   */
  static async updateSystemParams(
    data: ParamData
  ): Promise<ApiResponse<ParamData>> {
    try {
      console.log("💾 Salvando parâmetros do sistema...");
      return await ApiService.post<ParamData>("/appsettings", data);
    } catch (error) {
      console.error("❌ Erro ao salvar parâmetros do sistema:", error);
      return {
        success: false,
        message: "Erro ao salvar parâmetros do sistema",
      };
    }
  }

  /**
   * Método genérico para obter parâmetros por tipo
   */
  static async getParams(type: ParamType): Promise<ApiResponse<ParamData>> {
    return type === "admin" ? this.getAdminParams() : this.getSystemParams();
  }

  /**
   * Método genérico para atualizar parâmetros por tipo
   */
  static async updateParams(
    type: ParamType,
    data: ParamData
  ): Promise<ApiResponse<ParamData>> {
    return type === "admin"
      ? this.updateAdminParams(data)
      : this.updateSystemParams(data);
  }

  /**
   * Validar JSON
   */
  static validateJSON(jsonString: string): {
    isValid: boolean;
    error?: string;
    parsed?: ParamData;
  } {
    try {
      const parsed = JSON.parse(jsonString);
      return { isValid: true, parsed };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "JSON inválido",
      };
    }
  }

  /**
   * Formatar JSON com indentação
   */
  static formatJSON(data: ParamData): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return "{}";
    }
  }
}
