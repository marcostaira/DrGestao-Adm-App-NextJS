// src/types/tenant.types.ts
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

export interface TenantData {
  client_name: string;
  email: string;
  tel1?: string;
  friendly_name?: string;
  active?: number;
  waactive?: number;
}

export interface Tenant {
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

export interface TenantStats {
  totalPatients: number;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  subscriptionStatus: "active" | "inactive" | "suspended" | "cancelled";
  subscriptionEndDate?: string;
}

export interface TenantFilters {
  status?: number | null;
  search?: string;
  page?: number;
  pageSize?: number;
}

export type TenantStatus = 0 | 1 | 3; // 0 = Cancelado, 1 = Ativo, 3 = Inativo
export type WhatsAppStatus = 0 | 1; // 0 = Desativado, 1 = Ativado
