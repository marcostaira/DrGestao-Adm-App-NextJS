'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAdminUserForm } from '@/hooks/useAdminUserForm';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User, Mail, Key, Shield } from 'lucide-react';

interface AdminUserFormPageProps {
  params: {
    id: string;
  };
}

export default function AdminUserFormPage({ params }: AdminUserFormPageProps) {
  const isNew = params.id === 'new';
  const userId = isNew ? undefined : params.id;
  
  const {
    formData,
    errors,
    loading,
    saving,
    loadError,
    isEditing,
    updateField,
    handleSubmit,
    handleCancel
  } = useAdminUserForm(userId);

  const { success, error, ToastContainer } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await handleSubmit();
    
    if (result.success) {
      success(result.message || 'Operação realizada com sucesso!');
    } else {
      error(result.message || 'Erro ao salvar usuário');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredLevel={2}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008089] mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando usuário...</p>
          </div>
        </div>
        <ToastContainer />
      </ProtectedRoute>
    );
  }

  if (loadError) {
    return (
      <ProtectedRoute requiredLevel={2}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">❌</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar</h2>
            <p className="text-gray-600 mb-4">{loadError}</p>
            <Button onClick={handleCancel} variant="secondary">
              Voltar para listagem
            </Button>
          </div>
        </div>
        <ToastContainer />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredLevel={2}>
      <div className="space-y-6">
        {/* Título */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing 
              ? 'Modifique as informações do usuário administrativo' 
              : 'Cadastre um novo usuário com acesso ao sistema'}
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Nome */}
            <Input
              label="Nome"
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={errors.name}
              required
              leftIcon={<User className="h-4 w-4" />}
              placeholder="Digite o nome completo"
              disabled={saving}
            />

            {/* Email */}
            <Input
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={errors.email}
              required
              leftIcon={<Mail className="h-4 w-4" />}
              placeholder="Digite o e-mail"
              disabled={saving}
            />

            {/* Login */}
            <Input
              label="Login"
              type="text"
              value={formData.login}
              onChange={(e) => updateField('login', e.target.value)}
              error={errors.login}
              required
              leftIcon={<User className="h-4 w-4" />}
              placeholder="Digite o login (sem espaços)"
              disabled={saving}
            />

            {/* Nível de Acesso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nível de Acesso
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <select
                  value={formData.level}
                  onChange={(e) => updateField('level', parseInt(e.target.value))}
                  required
                  disabled={saving}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008089] focus:border-transparent disabled:opacity-50"
                >
                  <option value={1}>Super Administrador</option>
                  <option value={2}>Administrador</option>
                  <option value={3}>Operador</option>
                  <option value={4}>Usuário</option>
                </select>
              </div>
              {errors.level && (
                <p className="mt-1 text-sm text-red-600">{errors.level[0]}</p>
              )}
            </div>

            {/* Status Ativo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => updateField('active', e.target.checked)}
                disabled={saving}
                className="h-4 w-4 text-[#008089] focus:ring-[#008089] border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Usuário ativo
              </label>
            </div>

            {/* Senhas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={isEditing ? "Nova Senha (opcional)" : "Senha"}
                type="password"
                value={formData.pwd}
                onChange={(e) => updateField('pwd', e.target.value)}
                error={errors.pwd}
                required={!isEditing}
                leftIcon={<Key className="h-4 w-4" />}
                placeholder={isEditing ? "Deixe vazio para manter atual" : "Digite a senha"}
                disabled={saving}
              />

              <Input
                label="Confirmar Senha"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                required={!isEditing || !!formData.pwd}
                leftIcon={<Key className="h-4 w-4" />}
                placeholder="Confirme a senha"
                disabled={saving}
              />
            </div>

            {/* Erros gerais */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{errors.general[0]}</p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                loading={saving}
                disabled={saving}
                className="bg-[#008089] hover:bg-[#006b73]"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer />
    </ProtectedRoute>
  );
}