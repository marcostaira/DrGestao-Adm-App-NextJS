'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Tabs, Tab } from '@/components/ui/Tabs';
import { JSONEditor } from '@/components/ui/JSONEditor';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAppParams } from '@/hooks/useAppParams';
import { Save, RotateCcw, Code } from 'lucide-react';

function AdminParamsTab() {
  const {
    code,
    setCode,
    loading,
    saving,
    error,
    loadParams,
    saveParams,
    isValidJSON,
    formatCode
  } = useAppParams('admin');

  const { success, error: showError, ToastContainer } = useToast();

  const handleSave = async () => {
    const result = await saveParams();
    
    if (result.success) {
      success(result.message);
    } else {
      showError(result.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008089] mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando parâmetros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <JSONEditor
          value={code}
          onChange={setCode}
          isValid={isValidJSON()}
          disabled={saving}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          variant="secondary"
          onClick={formatCode}
          disabled={saving || !isValidJSON()}
          leftIcon={<Code className="h-4 w-4" />}
        >
          Formatar
        </Button>

        <Button
          variant="secondary"
          onClick={loadParams}
          disabled={saving}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Recarregar
        </Button>

        <Button
          onClick={handleSave}
          disabled={saving || !isValidJSON()}
          loading={saving}
          className="bg-[#008089] hover:bg-[#006b73]"
          leftIcon={<Save className="h-4 w-4" />}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <ToastContainer />
    </div>
  );
}

function SystemParamsTab() {
  const {
    code,
    setCode,
    loading,
    saving,
    error,
    loadParams,
    saveParams,
    isValidJSON,
    formatCode
  } = useAppParams('system');

  const { success, error: showError, ToastContainer } = useToast();

  const handleSave = async () => {
    const result = await saveParams();
    
    if (result.success) {
      success(result.message);
    } else {
      showError(result.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008089] mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando parâmetros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <JSONEditor
          value={code}
          onChange={setCode}
          isValid={isValidJSON()}
          disabled={saving}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          variant="secondary"
          onClick={formatCode}
          disabled={saving || !isValidJSON()}
          leftIcon={<Code className="h-4 w-4" />}
        >
          Formatar
        </Button>

        <Button
          variant="secondary"
          onClick={loadParams}
          disabled={saving}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Recarregar
        </Button>

        <Button
          onClick={handleSave}
          disabled={saving || !isValidJSON()}
          loading={saving}
          className="bg-[#008089] hover:bg-[#006b73]"
          leftIcon={<Save className="h-4 w-4" />}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <ToastContainer />
    </div>
  );
}

export default function AppParamsPage() {
  const tabs: Tab[] = [
    {
      id: 'admin',
      label: 'Parâmetros Administrativos',
      content: <AdminParamsTab />
    },
    {
      id: 'system',
      label: 'Parâmetros do Sistema',
      content: <SystemParamsTab />
    }
  ];

  return (
    <ProtectedRoute requiredLevel={1}>
      <div className="space-y-6">
        {/* Título */}
        <div className="bg-white shadow-sm rounded-xl p-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Configuração de Parâmetros
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie os parâmetros administrativos e do sistema DrGestão
          </p>
        </div>

        {/* Abas */}
        <div className="bg-white shadow-sm rounded-xl p-6">
          <Tabs tabs={tabs} defaultTab="admin" />
        </div>
      </div>
    </ProtectedRoute>
  );
}