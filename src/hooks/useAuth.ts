"use client";

import { useState, useEffect } from "react";
import { AuthService } from "@/services/auth.service";
import { User, LoginCredentials } from "@/types/auth.types";

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
  }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasLevel: (level: number) => boolean;
  canAccess: (area: string) => boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação ao carregar
    const checkAuth = () => {
      try {
        if (AuthService.isAuthenticated()) {
          const userData = AuthService.getCurrentUser();
          if (userData) {
            // Garantir que permissions sempre existe
            if (!userData.permissions) {
              userData.permissions = [];
            }
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(credentials);

      if (result.success && result.data) {
        setUser(result.data.user);
      }

      return {
        success: result.success,
        message: result.message,
        errors: result.errors,
      };
    } catch (error) {
      return {
        success: false,
        message: "Erro inesperado. Tente novamente.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return AuthService.hasPermission(permission);
  };

  const hasRole = (role: string): boolean => {
    return AuthService.hasRole(role);
  };

  const hasLevel = (level: number): boolean => {
    return AuthService.hasLevel(level);
  };

  const canAccess = (area: string): boolean => {
    return AuthService.canAccess(area);
  };

  return {
    user,
    isAuthenticated: !!user && user.active,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole,
    hasLevel,
    canAccess,
  };
}
