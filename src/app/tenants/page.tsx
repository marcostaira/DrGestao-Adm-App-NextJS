/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, MessageCircle, Plus, Search, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TenantService } from "@/services/tenant.service";
import { Tenant, TenantsResponse } from "@/types/tenant.types";

const TenantsListPage = () => {
  const router = useRouter();

  // Estados
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalTenants, setTotalTenants] = useState(0);
  const [statusFilter, setStatusFilter] = useState<number | null>(1); // Padrão: Ativos
  const [allLoaded, setAllLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Tenants filtrados por busca (aplicado no frontend após carregar do backend)
  const filteredTenants = useMemo(() => {
    if (!searchTerm.trim()) return tenants;

    const term = searchTerm.toLowerCase();
    return tenants.filter(
      (tenant) =>
        (tenant.client_name || "").toLowerCase().includes(term) ||
        (tenant.email || "").toLowerCase().includes(term) ||
        (tenant.tel1 || "").toLowerCase().includes(term)
    );
  }, [tenants, searchTerm]);

  // Carrega os tenants
  const loadTenants = useCallback(
    async (reset: boolean = false) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const currentPage = reset ? 1 : page;
        const response = await TenantService.getTenants(
          currentPage,
          pageSize,
          statusFilter
        );

        if (response.success && response.data) {
          const mapped: Tenant[] = (response.data.data || []).map((t: any) => ({
            id: t.id,
            date_add: t.date_add,
            client_name: t.client_name || t.friendly_name,
            email: t.email,
            tel1: t.tel1,
            pacientes: t.patients_count || 0,
            usuarios: t.users_count || 0,
            waactive: t.waactive || 0,
            active: t.active || 0,
          }));

          if (reset) {
            setTenants(mapped);
            setPage(1);
          } else {
            setTenants((prev) => [...prev, ...mapped]);
          }

          setTotalTenants(response.data.total || mapped.length);

          // Verifica se carregou todos os registros
          const newTotal = reset
            ? mapped.length
            : tenants.length + mapped.length;
          if (newTotal >= response.data.total || mapped.length < pageSize) {
            setAllLoaded(true);
          }
        } else {
          setError(response.message || "Erro ao carregar tenants");
        }
      } catch (err) {
        setError("Erro interno do servidor");
        console.error("Erro ao carregar tenants:", err);
      } finally {
        setLoading(false);
      }
    },
    [loading, page, pageSize, statusFilter, tenants.length]
  );

  // Efeito para carregar dados quando statusFilter muda
  useEffect(() => {
    setTenants([]);
    setPage(1);
    setAllLoaded(false);
    loadTenants(true);
  }, [statusFilter]);

  // Carregamento inicial
  useEffect(() => {
    loadTenants(true);
  }, []);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 && // Carrega quando faltam 1000px para o fim
        !loading &&
        !allLoaded &&
        filteredTenants.length > 0
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, allLoaded, filteredTenants.length]);

  // Carregar mais quando page muda
  useEffect(() => {
    if (page > 1) {
      loadTenants();
    }
  }, [page]);

  // Filtra por status
  const filterByStatus = (status: number | null) => {
    setStatusFilter(status);
    // O useEffect acima irá detectar a mudança e recarregar
  };

  // Aplica filtro de busca
  const applyFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.trim());
  };

  // Navegação
  const goToUsers = (id: number) => {
    router.push(`/tenants/${id}/users`);
  };

  const goToTenant = (id: number) => {
    router.push(`/tenants/${id}`);
  };

  const goToNewTenant = () => {
    router.push("/tenants/new");
  };

  const openTemplates = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    router.push(`/tenant/${id}/templates`);
  };

  // Helpers para status
  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 1:
        return "Ativo";
      case 3:
        return "Inativo";
      case 0:
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  const getStatusClass = (status: number): string => {
    switch (status) {
      case 1:
        return "text-green-600 bg-green-100";
      case 3:
        return "text-yellow-600 bg-yellow-100";
      case 0:
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getWaStatusLabel = (status: number): string => {
    return status === 1 ? "Ativado" : "Desativado";
  };

  const getWaStatusClass = (status: number): string => {
    return status === 1
      ? "text-green-600 bg-green-100"
      : "text-gray-600 bg-gray-100";
  };

  // Botões de filtro de status
  const statusButtons = [
    { label: "Ativos", value: 1, color: "teal" },
    { label: "Inativos", value: 3, color: "yellow" },
    { label: "Cancelados", value: 0, color: "red" },
    { label: "Todos", value: null, color: "blue" },
  ];

  const getButtonClass = (value: number | null, color: string) => {
    const isActive = statusFilter === value;
    const baseClass = "px-3 py-1 rounded shadow transition-colors";

    if (isActive) {
      switch (color) {
        case "teal":
          return `${baseClass} bg-teal-700 text-white`;
        case "yellow":
          return `${baseClass} bg-yellow-600 text-white`;
        case "red":
          return `${baseClass} bg-red-600 text-white`;
        case "blue":
          return `${baseClass} bg-blue-600 text-white`;
        default:
          return `${baseClass} bg-gray-600 text-white`;
      }
    }

    return `${baseClass} bg-gray-100 text-gray-800 hover:bg-gray-200`;
  };

  return (
    <ProtectedRoute requiredLevel={2}>
      <div className="p-6">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Lista de Clientes
          </h1>
          <p className="text-gray-600">
            Gerencie os clientes e suas informações no sistema
          </p>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
            <button
              onClick={goToNewTenant}
              className="bg-[#008089] text-white px-4 py-2 rounded-lg hover:bg-[#006b73] transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Cliente
            </button>

            {/* Campo de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={applyFilter}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008089] focus:border-transparent w-80"
              />
            </div>
          </div>

          {/* Filtros de Status */}
          <div className="flex flex-wrap gap-2 mt-4">
            {statusButtons.map((button) => (
              <button
                key={button.label}
                onClick={() => filterByStatus(button.value)}
                className={getButtonClass(button.value, button.color)}
              >
                {button.label}
              </button>
            ))}
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-gray-600">
            {searchTerm ? (
              <span>
                Mostrando {filteredTenants.length} de {tenants.length} clientes
                {statusFilter !== null && (
                  <span className="ml-2">
                    (filtro:{" "}
                    {statusButtons.find((b) => b.value === statusFilter)?.label}
                    )
                  </span>
                )}
              </span>
            ) : (
              <span>
                {tenants.length} de {totalTenants} clientes carregados
                {statusFilter !== null && (
                  <span className="ml-2">
                    (filtro:{" "}
                    {statusButtons.find((b) => b.value === statusFilter)?.label}
                    )
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabela de Tenants */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estatísticas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    onClick={() => goToTenant(tenant.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tenant.client_name || "Sem nome"}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {tenant.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tenant.email}
                      </div>
                      <div className="text-sm text-gray-500">{tenant.tel1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Pacientes: {tenant.pacientes}</div>
                      <div>Usuários: {tenant.usuarios}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                          tenant.active
                        )}`}
                      >
                        {getStatusLabel(tenant.active)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getWaStatusClass(
                          tenant.waactive
                        )}`}
                      >
                        {getWaStatusLabel(tenant.waactive)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            goToUsers(tenant.id);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                          title="Usuários"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => openTemplates(tenant.id, e)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                          title="Templates"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center p-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#008089]" />
              <span className="ml-2 text-gray-600">
                Carregando mais clientes...
              </span>
            </div>
          )}

          {/* Indicador de fim dos dados */}
          {!loading && allLoaded && tenants.length > 0 && (
            <div className="text-center p-4 text-gray-500 text-sm">
              Todos os clientes foram carregados
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredTenants.length === 0 && tenants.length === 0 && (
            <div className="text-center p-8 text-gray-500">
              Nenhum cliente encontrado.
            </div>
          )}

          {/* Empty state para busca */}
          {!loading &&
            filteredTenants.length === 0 &&
            tenants.length > 0 &&
            searchTerm && (
              <div className="text-center p-8 text-gray-500">
                Nenhum cliente encontrado com os critérios de busca &quot;
                {searchTerm}&ldquo;.
              </div>
            )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TenantsListPage;
