'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredLevel={3}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Relatórios e Analytics
          </h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">📊 Dashboard de Relatórios</h3>
            <p className="text-green-700 text-sm">
              Central de relatórios e métricas do sistema.
            </p>
            
            <div className="mt-4 space-y-2 text-sm text-green-600">
              <div>• Gráficos de usuários ativos</div>
              <div>• Estatísticas de login</div>
              <div>• Relatórios de atividade</div>
              <div>• Exportação de dados</div>
              <div>• Logs de sistema</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}