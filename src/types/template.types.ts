// src/types/template.types.ts

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

export interface TemplateForm {
  content: string;
  active: boolean;
}

export interface UpdateTemplateData {
  content: string;
  active?: boolean;
}

export interface CreateTemplateData {
  type: string;
  content: string;
  active?: boolean;
}

export interface TemplateVariable {
  name: string;
  description: string;
  example?: string;
}

export interface TemplateValidation {
  isValid: boolean;
  invalidVariables: string[];
  validVariables: string[];
  errors?: string[];
}

// Enum para tipos de template mais comuns
export enum TemplateType {
  CONFIRMACAO_CONSULTA = "confirmacao_consulta",
  LEMBRETE_CONSULTA = "lembrete_consulta",
  CANCELAMENTO_CONSULTA = "cancelamento_consulta",
  REAGENDAMENTO_CONSULTA = "reagendamento_consulta",
  BOAS_VINDAS = "boas_vindas",
  AVALIACAO_SERVICO = "avaliacao_servico",
  PROMOCAO = "promocao",
  ANIVERSARIO = "aniversario",
}

// Enum para status do template
export enum TemplateStatus {
  INACTIVE = 0,
  ACTIVE = 1,
}
