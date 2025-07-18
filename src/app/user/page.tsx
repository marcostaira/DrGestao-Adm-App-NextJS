'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function UsersPage() {
  return (
    <ProtectedRoute requiredLevel={3}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Gerenciamento de Usuários
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Módulo de Usuários</h3>
            <p className="text-blue-700 text-sm">
              Esta página será implementada com CRUD completo de usuários da tabela gas_admusr.
            </p>
            
            <div className="mt-4 space-y-2 text-sm text-blue-600">
              <div>• Listagem de usuários com paginação</div>
              <div>• Filtros por name, email, login, level</div>
              <div>• Criar novo usuário</div>
              <div>• Editar usuário existente</div>
              <div>• Ativar/desativar usuário</div>
              <div>• Alterar level de acesso</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}