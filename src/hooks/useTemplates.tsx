/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { TemplateService, Template } from '@/services/template.service';

export interface TemplateFormData {
  content: string;
  active: boolean;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateForms, setTemplateForms] = useState<Record<number, TemplateFormData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingTemplates, setSavingTemplates] = useState<Set<number>>(new Set());

  // Carregar templates
  const loadTemplates = async () => {
    setLoading(true);
    setError(null);

    const response = await TemplateService.getDefaultTemplates();

    if (response.success && response.data) {
      setTemplates(response.data);
      
      // Inicializar formulários para cada template
      const forms: Record<number, TemplateFormData> = {};
      response.data.forEach(template => {
        forms[template.id] = {
          content: template.content,
          active: template.active
        };
      });
      setTemplateForms(forms);
    } else {
      setError(response.message || 'Erro ao carregar templates');
    }

    setLoading(false);
  };

  // Atualizar campo de um template específico
  const updateTemplateField = (templateId: number, field: keyof TemplateFormData, value: any) => {
    setTemplateForms(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [field]: value
      }
    }));
  };

  // Salvar template específico
  const saveTemplate = async (template: Template): Promise<{ success: boolean; message: string }> => {
    const formData = templateForms[template.id];
    if (!formData) {
      return { success: false, message: 'Dados do formulário não encontrados' };
    }

    // Validar variáveis do template
    const validation = TemplateService.validateTemplateVariables(formData.content);
    if (!validation.isValid) {
      return {
        success: false,
        message: `Variáveis inválidas encontradas: ${validation.invalidVariables.join(', ')}`
      };
    }

    // Marcar como salvando
    setSavingTemplates(prev => new Set(prev).add(template.id));

    const updatedTemplate: Template = {
      ...template,
      content: formData.content,
      active: formData.active
    };

    const response = await TemplateService.updateTemplate(updatedTemplate);

    // Remover do estado de salvando
    setSavingTemplates(prev => {
      const newSet = new Set(prev);
      newSet.delete(template.id);
      return newSet;
    });

    if (response.success) {
      // Atualizar template na lista local
      setTemplates(prev => 
        prev.map(t => t.id === template.id ? updatedTemplate : t)
      );

      return {
        success: true,
        message: `Template "${TemplateService.formatTemplateType(template.type)}" atualizado com sucesso!`
      };
    } else {
      return {
        success: false,
        message: response.message || `Erro ao atualizar template "${TemplateService.formatTemplateType(template.type)}"`
      };
    }
  };

  // Copiar variável para clipboard
  const copyVariableToClipboard = async (variableName: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(`{{${variableName}}}`);
      return true;
    } catch (error) {
      console.error('Erro ao copiar para clipboard:', error);
      return false;
    }
  };

  // Verificar se template foi modificado
  const isTemplateModified = (template: Template): boolean => {
    const formData = templateForms[template.id];
    if (!formData) return false;

    return (
      formData.content !== template.content ||
      formData.active !== template.active
    );
  };

  // Resetar template para valores originais
  const resetTemplate = (template: Template) => {
    setTemplateForms(prev => ({
      ...prev,
      [template.id]: {
        content: template.content,
        active: template.active
      }
    }));
  };

  // Carregar na inicialização
  useEffect(() => {
    loadTemplates();
  }, []);

  return {
    templates,
    templateForms,
    loading,
    error,
    savingTemplates,
    loadTemplates,
    updateTemplateField,
    saveTemplate,
    copyVariableToClipboard,
    isTemplateModified,
    resetTemplate
  };
}