export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Tipo da resposta da API baseado na estrutura do DB
interface ApiUserResponse {
  id: number;
  name: string;
  email: string;
  login: string;
  active: number | string; // Pode vir como number ou string do backend
  level: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  login: string;
  active: boolean; // Convertido: true = ativo, false = inativo
  level: number;
  role: UserRole;
  permissions: string[];
  lastLogin?: Date;
}

export type UserRole = 'super-admin' | 'admin' | 'operator' | 'user';

// Mapeamento de levels para roles
export const LEVEL_TO_ROLE: Record<number, UserRole> = {
  1: 'super-admin',
  2: 'admin', 
  3: 'operator',
  4: 'user'
};

export interface JWTPayload {
  userId: number;
  email: string;
  login: string;
  name: string;
  level: number;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}