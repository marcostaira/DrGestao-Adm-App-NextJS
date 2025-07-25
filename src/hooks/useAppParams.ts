'use client';

import { useState, useEffect } from 'react';
import { AppParamsService, ParamType, ParamData } from '@/services/app-params.service';

export function useAppParams(type: ParamType) {
  const [code, setCode] = useState<string>('{}');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar parâmetros
  const loadParams = async () => {
    setLoading(true);
    setError(null);

    const response = await AppParamsService.getParams(type);

    if (response.success && response.data) {
      setCode(AppParamsService.formatJSON(response.data));
    } else {
      setError(response.message || 'Erro ao carregar parâmetros');
      setCode('{}');
    }

    setLoading(false);
  };

  // Salvar parâmetros
  const saveParams = async (): Promise<{ success: boolean; message: string }> => {
    // Validar JSON
    const validation = AppParamsService.validateJSON(code);
    
    if (!validation.isValid) {
      return {
        success: false,
        message: `JSON inválido: ${validation.error}`
      };
    }

    setSaving(true);
    setError(null);

    const response = await AppParamsService.updateParams(type, validation.parsed!);

    setSaving(false);

    if (response.success) {
      return {
        success: true,
        message: 'Parâmetros salvos com sucesso!'
      };
    } else {
      return {
        success: false,
        message: response.message || 'Erro ao salvar parâmetros'
      };
    }
  };

  // Verificar se JSON é válido em tempo real
  const isValidJSON = (): boolean => {
    return AppParamsService.validateJSON(code).isValid;
  };

  // Formatar JSON
  const formatCode = () => {
    const validation = AppParamsService.validateJSON(code);
    if (validation.isValid && validation.parsed) {
      setCode(AppParamsService.formatJSON(validation.parsed));
    }
  };

  // Carregar na inicialização
  useEffect(() => {
    loadParams();
  }, [type]);

  return {
    code,
    setCode,
    loading,
    saving,
    error,
    loadParams,
    saveParams,
    isValidJSON,
    formatCode
  };
}