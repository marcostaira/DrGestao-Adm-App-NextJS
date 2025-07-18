'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SecuritySettingsPage() {
  return (
    <ProtectedRoute requiredLevel={1}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Configurações de Segurança
          </h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">🔒 Área Super Restrita</h3>
            <p className="text-red-700 text-sm">
              Esta área é acessível apenas para Super Administradores (Level 1).
            </p>
            
            <div className="mt-4 space-y-2 text-sm text-red-600">
              <div>• Configurações de JWT</div>
              <div>• Políticas de senha</div>
              <div>• Configurações de sessão</div>
              <div>• Firewall e rate limiting</div>
              <div>• Auditoria de segurança</div>
              <div>• Logs de acesso</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}