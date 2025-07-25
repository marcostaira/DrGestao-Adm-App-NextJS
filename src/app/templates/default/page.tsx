/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useTemplates } from '@/hooks/useTemplates';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { TemplateService } from '@/services/template.service';
import { Save, Copy, RotateCcw, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function TemplatesDefaultPage() {
  const {
    templates,
    templateForms,
    loading,
    error,
    savingTemplates,
    updateTemplateField,
    saveTemplate,
    copyVariableToClipboard,
    isTemplateModified,
    resetTemplate
  } = useTemplates();

  const { success, error: showError, ToastContainer } = useToast();

  const handleSaveTemplate = async (template: any) => {
    const result = await saveTemplate(template);
    
    if (result.success) {
      success(result.message);
    } else {
      showError(result.message);
    }
  };

  const handleCopyVariable = async (variableName: string) => {
    const copied = await copyVariableToClipboard(variableName);
    
    if (copied) {
      success('Variável copiada para a área de transferência!');
    } else {
      showError('Erro ao copiar variável');
    }
  };

  const availableVariables = TemplateService.getAvailableVariables();

  if (loading) {
    return (
      <ProtectedRoute requiredLevel={2}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008089] mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando templates...</p>
          </div>
        </div>
        <ToastContainer />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredLevel={2}>
      <div className="space-y-8">
        {/* Título */}
        <div className="bg-white shadow-sm rounded-xl p-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-[#008089]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Templates Padrão de WhatsApp
              </h1>
              <p className="text-gray-600 mt-1">
                Configure as mensagens automáticas do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Variáveis Disponíveis */}
        <div className="bg-white shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Variáveis Disponíveis
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Clique em uma variável para copiá-la para a área de transferência:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableVariables.map((variable) => (
              <div
                key={variable.name}
                onClick={() => handleCopyVariable(variable.name)}
                className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-[#008089] font-medium">
                    {`{{${variable.name}}}`}
                  </code>
                  <Copy className="h-4 w-4 text-gray-400 group-hover:text-[#008089] transition-colors" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {variable.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Templates */}
        <div className="space-y-6">
          {templates.map((template) => {
            const formData = templateForms[template.id];
            const isSaving = savingTemplates.has(template.id);
            const isModified = isTemplateModified(template);
            const validation = TemplateService.validateTemplateVariables(formData?.content || '');

            if (!formData) return null;

            return (
              <div key={template.id} className="bg-white shadow-sm rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {TemplateService.formatTemplateType(template.type)}
                  </h3>
                  
                  {isModified && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Modificado
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => updateTemplateField(template.id, 'content', e.target.value)}
                      rows={5}
                      disabled={isSaving}
                      className={cn(
                        "w-full px-4 py-3 border rounded-lg shadow-sm resize-none",
                        "focus:outline-none focus:ring-2 focus:ring-[#008089] focus:border-transparent",
                        "placeholder-gray-400 transition-colors text-gray-900",
                        "font-sans leading-relaxed emoji-support",
                        !validation.isValid && "border-red-300 bg-red-50",
                        isSaving && "opacity-50 cursor-not-allowed"
                      )}
                      placeholder="Digite a mensagem do template..."
                      style={{
                        fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Twitter Color Emoji", "EmojiOne Color", "Android Emoji", "Segoe UI Symbol", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontVariantEmoji: 'emoji' as any,
                        textRendering: 'optimizeLegibility' as any
                      }}
                    />
                    
                    {/* Validação de variáveis */}
                    {!validation.isValid && (
                      <div className="mt-2 text-sm text-red-600">
                        <p>Variáveis inválidas: {validation.invalidVariables.join(', ')}</p>
                      </div>
                    )}
                    
                    {validation.validVariables.length > 0 && (
                      <div className="mt-2 text-sm text-green-600">
                        <p>Variáveis válidas: {validation.validVariables.join(', ')}</p>
                      </div>
                    )}
                  </div>

                  {/* Checkbox Ativo (comentado conforme original) */}
                  {/* 
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`active-${template.id}`}
                      checked={formData.active}
                      onChange={(e) => updateTemplateField(template.id, 'active', e.target.checked)}
                      disabled={isSaving}
                      className="h-4 w-4 text-[#008089] focus:ring-[#008089] border-gray-300 rounded"
                    />
                    <label htmlFor={`active-${template.id}`} className="ml-2 text-sm text-gray-700">
                      Ativo
                    </label>
                  </div>
                  */}

                  {/* Ações */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleSaveTemplate(template)}
                      disabled={isSaving || !validation.isValid}
                      loading={isSaving}
                      className="bg-[#008089] hover:bg-[#006b73]"
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </Button>

                    {isModified && (
                      <Button
                        variant="secondary"
                        onClick={() => resetTemplate(template)}
                        disabled={isSaving}
                        leftIcon={<RotateCcw className="h-4 w-4" />}
                      >
                        Reverter
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informações */}
        {templates.length === 0 && !loading && (
          <div className="bg-white shadow-sm rounded-xl p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum template encontrado
            </h3>
            <p className="text-gray-500">
              Não há templates padrão configurados no sistema.
            </p>
          </div>
        )}
      </div>

      <ToastContainer />
    </ProtectedRoute>
  );
}