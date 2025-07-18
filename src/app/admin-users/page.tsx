"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { AdminUsersService } from "@/services/admin-users.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { Plus, Search, Users } from "lucide-react";

export default function AdminUsersListPage() {
  const router = useRouter();
  const { users, loading, error, search, sortConfig, applyFilter, handleSort } =
    useAdminUsers();

  const handleGoToUser = (id: number) => {
    router.push(`/admin-users/${id}`);
  };

  const handleNewUser = () => {
    router.push("/admin-users/new");
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    applyFilter(event.target.value);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredLevel={2}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008089] mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando usuários...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredLevel={2}>
      <div className="space-y-6">
        {/* Título */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Usuários Administrativos
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie os usuários com acesso ao sistema administrativo
          </p>
        </div>

        {/* Barra de ações */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Campo de busca */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Buscar usuários..."
                value={search}
                onChange={handleSearch}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Botão novo usuário */}
            <Button
              onClick={handleNewUser}
              className="bg-[#008089] hover:bg-[#006b73]"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader
                    field="id"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    #
                  </SortableHeader>

                  <SortableHeader
                    field="name"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    Nome
                  </SortableHeader>

                  <SortableHeader
                    field="email"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    E-mail
                  </SortableHeader>

                  <SortableHeader
                    field="login"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    Login
                  </SortableHeader>

                  <SortableHeader
                    field="active"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    Status
                  </SortableHeader>

                  <SortableHeader
                    field="level"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    Nível
                  </SortableHeader>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">
                          {search
                            ? "Nenhum usuário encontrado"
                            : "Nenhum usuário cadastrado"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleGoToUser(user.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.login}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={AdminUsersService.getStatusColor(
                            user.active
                          )}
                        >
                          {AdminUsersService.getStatusLabel(user.active)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {AdminUsersService.getLevelLabel(user.level)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#008089] hover:text-[#006b73] hover:bg-[#008089]/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoToUser(user.id);
                          }}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informações da listagem */}
        {users.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="text-sm text-gray-600">
                Mostrando {users.length} usuário{users.length !== 1 ? "s" : ""}
                {search && ` para "${search}"`}
              </p>

              <p className="text-xs text-gray-500">
                Ordenado por:{" "}
                <span className="font-medium text-[#008089]">
                  {sortConfig.field === "id" && "#"}
                  {sortConfig.field === "name" && "Nome"}
                  {sortConfig.field === "email" && "E-mail"}
                  {sortConfig.field === "login" && "Login"}
                  {sortConfig.field === "active" && "Status"}
                  {sortConfig.field === "level" && "Nível"}
                </span>{" "}
                ({sortConfig.direction === "asc" ? "Crescente" : "Decrescente"})
              </p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
