'use client';

import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getLevelDescription } from '@/lib/auth/permissions';

export default function DashboardPage() {
  const { user, canAccess } = useAuth();

  return (
    <ProtectedRoute requiredLevel={4}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Dashboard
          </h1>
          
          {user && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Bem-vindo, {user.name || 'Usuário'}!
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>ID:</strong> {user.id || 'N/A'}</p>
                <p><strong>Login:</strong> {user.login || 'N/A'}</p>
                <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                <p><strong>Level:</strong> {user.level || 'N/A'} - {user.level ? getLevelDescription(user.level) : 'N/A'}</p>
                <p><strong>Status:</strong> 
                  <span className={user.active ? 'text-green-600' : 'text-red-600'}>
                    {user.active ? '✅ Ativo (1)' : '❌ Inativo (0)'}
                  </span>
                </p>
                <p><strong>Permissões:</strong> {user.permissions?.length ? user.permissions.join(', ') : 'Nenhuma'}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-green-800">✅ Layout Implementado:</h3>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• Toolbar com menu hambúrguer</li>
                <li>• Sidebar com menu sanfonado</li>
                <li>• Menu de usuário com dropdown</li>
                <li>• Rotas protegidas por level</li>
                <li>• Layout responsivo</li>
              </ul>
            </div>

            {user && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-semibold text-blue-800">🔑 Seus Acessos:</h3>
                <div className="text-sm text-blue-700 mt-2 space-y-1">
                  <div>Dashboard: {canAccess('dashboard') ? '✅ Permitido' : '❌ Negado'}</div>
                  <div>Usuários: {canAccess('users') ? '✅ Permitido' : '❌ Negado'}</div>
                  <div>Relatórios: {canAccess('reports') ? '✅ Permitido' : '❌ Negado'}</div>
                  <div>Configurações: {canAccess('settings') ? '✅ Permitido' : '❌ Negado'}</div>
                  <div>Logs: {canAccess('logs') ? '✅ Permitido' : '❌ Negado'}</div>
                  <div>Sistema: {canAccess('system') ? '✅ Permitido' : '❌ Negado'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Funcionalidades</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="font-medium text-gray-900">Sidebar</h4>
              <p className="text-sm text-gray-600 mt-1">Menu lateral com navegação sanfonada e controle de permissões</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="font-medium text-gray-900">Toolbar</h4>
              <p className="text-sm text-gray-600 mt-1">Barra superior com toggle do menu e área do usuário</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="font-medium text-gray-900">Rotas Protegidas</h4>
              <p className="text-sm text-gray-600 mt-1">Sistema de proteção baseado em levels e permissões</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
