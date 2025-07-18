'use client';

import { useState, useEffect } from 'react';
import { AdminUsersService, AdminUser } from '@/services/admin-users.service';

export type SortField = 'id' | 'name' | 'email' | 'login' | 'active' | 'level';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'id', direction: 'asc' });

  // Carregar usuários
  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    const response = await AdminUsersService.getAllUsers();

    if (response.success && response.data) {
      setUsers(response.data);
      // Aplicar ordenação e filtro após carregar
      applySortAndFilter(response.data, search, sortConfig);
    } else {
      setError(response.message || 'Erro ao carregar usuários');
    }

    setLoading(false);
  };

  // Aplicar ordenação e filtro
  const applySortAndFilter = (
    userList: AdminUser[] = users, 
    searchValue: string = search, 
    sort: SortConfig = sortConfig
  ) => {
    let result = [...userList];

    // Aplicar filtro primeiro
    if (searchValue.trim()) {
      result = result.filter(user =>
        Object.values(user).some(value =>
          value?.toString().toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }

    // Aplicar ordenação
    result.sort((a, b) => {
      let aValue = a[sort.field];
      let bValue = b[sort.field];

      // Tratar diferentes tipos de dados
      if (sort.field === 'active') {
        // Para status, ordenar por ativo primeiro
        aValue = a.active === 1 ? 'Ativo' : 'Inativo';
        bValue = b.active === 1 ? 'Ativo' : 'Inativo';
      } else if (sort.field === 'level') {
        // Para level, usar as labels
        aValue = AdminUsersService.getLevelLabel(a.level);
        bValue = AdminUsersService.getLevelLabel(b.level);
      }

      // Conversão para string para comparação
      const aStr = aValue?.toString().toLowerCase() || '';
      const bStr = bValue?.toString().toLowerCase() || '';

      if (sort.direction === 'asc') {
        return aStr.localeCompare(bStr, 'pt-BR', { numeric: true });
      } else {
        return bStr.localeCompare(aStr, 'pt-BR', { numeric: true });
      }
    });

    setFilteredUsers(result);
  };

  // Filtrar usuários
  const applyFilter = (searchValue: string) => {
    setSearch(searchValue);
    applySortAndFilter(users, searchValue, sortConfig);
  };

  // Ordenar usuários
  const handleSort = (field: SortField) => {
    const newDirection: SortDirection = 
      sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    
    const newSortConfig = { field, direction: newDirection };
    setSortConfig(newSortConfig);
    applySortAndFilter(users, search, newSortConfig);
  };

  // Deletar usuário
  const deleteUser = async (id: number) => {
    const response = await AdminUsersService.deleteUser(id);
    
    if (response.success) {
      // Recarregar lista após deletar
      await loadUsers();
      return { success: true };
    } else {
      return { 
        success: false, 
        message: response.message || 'Erro ao deletar usuário' 
      };
    }
  };

  // Carregar na inicialização
  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users: filteredUsers,
    loading,
    error,
    search,
    sortConfig,
    loadUsers,
    applyFilter,
    handleSort,
    deleteUser
  };
}