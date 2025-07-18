'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredLevel?: number;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredLevel,
  requiredPermission,
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasLevel, hasPermission } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  // Check level permission
  if (requiredLevel && !hasLevel(requiredLevel)) {
    return fallback || (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Acesso Restrito</h2>
            <p className="text-red-600">
              Você não tem permissão para acessar esta área. 
              É necessário level {requiredLevel} ou superior.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Check specific permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Permissão Insuficiente</h2>
            <p className="text-red-600">
              Você não tem a permissão {requiredPermission} necessária para acessar esta funcionalidade.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // All checks passed, render children with layout
  return (
    <Layout>
      {children}
    </Layout>
  );
}