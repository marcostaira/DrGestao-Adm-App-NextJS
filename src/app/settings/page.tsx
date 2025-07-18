'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredLevel={2}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Configurações do Sistema
          </h1>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">⚙️ Configurações Gerais</h3>
            <p className="text-amber-700 text-sm">
              Área restrita para administradores (Level 2 ou superior).
            </p>
            
            <div className="mt-4 space-y-2 text-sm text-amber-600">
              <div>• Configurações do sistema</div>
              <div>• Parâmetros de segurança</div>
              <div>• Configurações de email</div>
              <div>• Backup e restauração</div>
              <div>• Logs de sistema</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}