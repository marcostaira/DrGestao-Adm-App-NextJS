"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MessageSquare,
  Copy,
  Save,
  Loader2,
  CheckCircle,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TenantService } from "@/services/tenant.service";
import { Button } from "@/components/ui/Button";

// Types
interface Template {
  id: number;
  type: string;
  content: string;
  active: boolean;
  client_name?: string;
}

interface TemplateForm {
  content: string;
  active: boolean;
}

const TenantTemplatesPage = () => {
  const router = useRouter();
  const params = useParams();
  const tenantId = parseInt(params?.id as string);

  // Estados
  const [templates, setTemplates] = useState<Template[]>([]);
  const [forms, setForms] = useState<{ [key: number]: TemplateForm }>({});
  const [loading, setLoading] = useState(true);
  const [savingTemplates, setSavingTemplates] = useState<Set<number>>(
    new Set()
  );
  const [clientName, setClientName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Variáveis disponíveis
  const templateVariables = [
    "nome_clinica",
    "nome_paciente",
    "data",
    "hora",
    "tel_clinica",
    "primeiro_nome_profissional",
    "nome_profissional",
  ];

  // Carregar templates
  useEffect(() => {
    if (tenantId) {
      loadTemplates();
    }
  }, [tenantId]);

  // Navegação
  const goBack = () => {
    router.back();
  };
  // Função loadTemplates - igual ao Angular
  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await TenantService.getTemplatesByTenant(tenantId);

      if (response.success && response.data) {
        const data = response.data;
        setTemplates(data);

        if (data.length > 0) {
          setClientName(data[0].client_name || "");
        }

        // Inicializar formulários - igual ao Angular
        const newForms: { [key: number]: TemplateForm } = {};
        data.forEach((template: Template) => {
          newForms[template.id] = {
            content: template.content,
            active: template.active,
          };
        });
        setForms(newForms);
      } else {
        setTemplates([]);
        setClientName("");
        setError(response.message || "Erro ao carregar templates");
      }
    } catch (err) {
      console.error("Erro ao carregar templates:", err);
      setError("Erro ao carregar templates");
      setTemplates([]);
      setClientName("Cliente não identificado");
    } finally {
      setLoading(false);
    }
  };

  // Atualizar conteúdo do template
  const updateTemplateContent = (templateId: number, content: string) => {
    setForms((prev) => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        content,
      },
    }));
  };

  // Função saveTemplate - igual ao Angular
  const saveTemplate = async (template: Template) => {
    const form = forms[template.id];
    if (!form) return;

    try {
      setSavingTemplates((prev) => new Set(prev).add(template.id));
      setError(null);

      // Objeto igual ao Angular
      const updatedTemplate = {
        content: form.content,
      };

      const response = await TenantService.updateTemplate(
        template.id,
        updatedTemplate
      );

      if (response.success) {
        setSuccessMessage("Template salvo com sucesso!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || "Erro ao salvar template");
      }
    } catch (err) {
      console.error("Erro ao salvar template:", err);
      setError("Erro ao salvar template");
    } finally {
      setSavingTemplates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(template.id);
        return newSet;
      });
    }
  };

  // Copiar variável para clipboard
  const copyToClipboard = async (variable: string) => {
    try {
      await navigator.clipboard.writeText(`{{${variable}}}`);
      setSuccessMessage("Variável copiada!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
      setError("Erro ao copiar variável");
    }
  };

  // Formatar tipo do template
  const formatTemplateType = (type: string): string => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Loading da página
  if (loading) {
    return (
      <ProtectedRoute requiredLevel={2}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#008089] mx-auto" />
            <p className="mt-4 text-gray-600">Carregando templates...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredLevel={2}>
      <div className="p-6">
        {/* Mensagens de feedback */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {clientName ? (
          <>
            {/* Card do Cliente */}
            <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-[#008089]" />
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-800">
                      Templates WhatsApp do cliente
                    </h1>
                    <p className="text-[#008089] ">{clientName}</p>
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
            </div>

            {/* Informações das Variáveis */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-sm text-gray-700 mb-3">
                Variáveis disponíveis:
              </h3>
              <div className="flex flex-wrap gap-2">
                {templateVariables.map((variable) => (
                  <button
                    key={variable}
                    onClick={() => copyToClipboard(variable)}
                    className="group bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm transition-colors cursor-pointer flex items-center gap-1"
                    title="Clique para copiar"
                  >
                    <code>{`{{${variable}}}`}</code>
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Clique em uma variável para copiá-la
              </p>
            </div>

            {/* Lista de Templates */}
            <div className="space-y-6">
              {templates.map((template) => {
                const form = forms[template.id];
                const isSaving = savingTemplates.has(template.id);

                if (!form) return null;

                return (
                  <div
                    key={template.id}
                    className="bg-white shadow-sm rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-800">
                        {formatTemplateType(template.type)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            template.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {template.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mensagem
                        </label>
                        <textarea
                          value={form.content}
                          onChange={(e) =>
                            updateTemplateContent(template.id, e.target.value)
                          }
                          rows={5}
                          className="w-full px-4 py-3 border border-gray-300 text-gray-500 rounded-lg shadow-sm focus:ring-2 focus:ring-[#008089] focus:border-[#008089] placeholder-gray-400 resize-none"
                          placeholder="Digite o conteúdo do template..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use as variáveis acima para personalizar a mensagem
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={() => saveTemplate(template)}
                          disabled={isSaving}
                          className="bg-[#008089] hover:bg-[#006b73] flex items-center gap-2"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {isSaving ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Cliente sem templates */
          <div className="bg-white shadow-sm rounded-xl p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Não existem templates para este cliente
            </h2>
            <p className="text-gray-500">
              Este cliente ainda não possui templates configurados ou não foi
              encontrado.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default TenantTemplatesPage;
