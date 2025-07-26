/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Users,
  Mail,
  Phone,
  Check,
  X,
  Loader2,
  Building2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TenantService } from "@/services/tenant.service";
import { Button } from "@/components/ui/Button";

// Types - baseado na resposta da sua API
interface TenantUser {
  id: number;
  name: string;
  pwd: string;
  login: string;
  email?: string;
  active: number;
  date_update: string;
  ip_update?: string;
  tenant_id?: number;
  level?: number;
}

// Types
interface TenantData {
  id: number;
  friendly_name: string;
  email: string;
  tel1: string;
  client_name?: string;
}

const TenantUsersListPage = () => {
  const router = useRouter();
  const params = useParams();
  const tenantId = parseInt(params?.id as string);

  // Estados
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    if (tenantId) {
      loadTenantData();
      loadUsers();
    }
  }, [tenantId]);

  // Carregar dados do tenant
  const loadTenantData = async () => {
    try {
      const response = await TenantService.getTenantById(tenantId);

      if (response.success && response.data) {
        setTenantData({
          id: response.data.id,
          friendly_name:
            response.data.friendly_name || response.data.client_name || "",
          email: response.data.email,
          tel1: response.data.tel1,
          client_name: response.data.client_name,
        });
      } else {
        setError(response.message || "Erro ao carregar dados do cliente");
      }
    } catch (err) {
      console.error("Erro ao buscar tenant:", err);
      setError("Erro interno ao carregar cliente");
    }
  };

  // Carregar usuários do tenant
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await TenantService.getUsersByTenant(tenantId);

      if (response.success && response.data) {
        // Mapear os dados da API para o tipo local
        const mappedUsers: TenantUser[] = response.data.map((user: any) => ({
          id: user.id,
          name: user.name,
          pwd: user.pwd || user.password || "********",
          login: user.login,
          email: user.email,
          active: user.active,
          date_update: user.date_update,
          ip_update: user.ip_update,
          tenant_id: user.tenant_id,
          level: user.level,
        }));

        setUsers(mappedUsers);
      } else {
        setError(response.message || "Erro ao carregar usuários");
      }
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Erro interno ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  // Alternar status do usuário
  const toggleUserStatus = async (user: TenantUser) => {
    const action = user.active ? "desativar" : "ativar";
    const newStatus = user.active ? 0 : 1;

    // Confirmar ação
    if (!confirm(`Deseja realmente ${action} o usuário "${user.name}"?`)) {
      return;
    }

    try {
      setUpdatingUserId(user.id);

      const updatedUserData = {
        ...user,
        active: newStatus,
        date_update: new Date().toISOString(),
        ip_update: "127.0.0.1", // Mock IP - você pode implementar pegar IP real
      };

      const response = await TenantService.updateUserStatus(
        user.id,
        updatedUserData
      );

      if (response.success) {
        // Atualizar localmente
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  active: newStatus,
                  date_update: new Date().toISOString(),
                  ip_update: "127.0.0.1",
                }
              : u
          )
        );
      } else {
        setError("Erro ao atualizar status do usuário");
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      setError("Erro interno ao atualizar usuário");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Navegação
  const goBack = () => {
    router.back();
  };

  const newUser = () => {
    router.push(`/tenants/${tenantId}/users/new`);
  };

  const goToTenantDetail = () => {
    router.push(`/tenants/${tenantId}`);
  };

  // Loading da página
  if (loading && !tenantData) {
    return (
      <ProtectedRoute requiredLevel={2}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#008089] mx-auto" />
            <p className="mt-4 text-gray-600">Carregando usuários...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredLevel={2}>
      <div className="p-6 space-y-6">
        {/* Informações do Cliente */}
        <div className="bg-white shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[#008089]" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Usuários do Cliente
                </h1>
                <p className="text-gray-600">
                  Gerencie os usuários que têm acesso ao sistema do cliente
                </p>
              </div>
            </div>
            <Button
              onClick={goBack}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>

          {tenantData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">Nome:</span>
                  <span>{tenantData.friendly_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">E-mail:</span>
                  <span>{tenantData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Tel:</span>
                  <span>{tenantData.tel1}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2">
            <Button
              onClick={newUser}
              className="bg-[#008089] hover:bg-[#006b73] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Usuário
            </Button>
            <Button
              onClick={goToTenantDetail}
              variant="primary"
              className="flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Ver Cliente
            </Button>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabela de Usuários */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#008089]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Senha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E-mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Atualização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ativo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm bg-gray-400 px-2 py-1 rounded">
                            {user.pwd}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.login}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.date_update
                            ? new Date(user.date_update).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleUserStatus(user)}
                            disabled={updatingUserId === user.id}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
                              user.active
                                ? "text-green-600 hover:bg-green-100"
                                : "text-red-600 hover:bg-red-100"
                            } ${
                              updatingUserId === user.id
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-gray-100"
                            }`}
                            title={
                              user.active
                                ? "Desativar usuário"
                                : "Ativar usuário"
                            }
                          >
                            {updatingUserId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.active ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estatísticas */}
        {users.length > 0 && (
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Estatísticas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-blue-600">
                      {users.length}
                    </p>
                    <p className="text-blue-600">Total de Usuários</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Check className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-green-600">
                      {users.filter((u) => u.active === 1).length}
                    </p>
                    <p className="text-green-600">Usuários Ativos</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <X className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-red-600">
                      {users.filter((u) => u.active === 0).length}
                    </p>
                    <p className="text-red-600">Usuários Inativos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default TenantUsersListPage;
