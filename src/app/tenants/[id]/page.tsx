"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Save,
  Loader2,
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TenantService } from "@/services/tenant.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// Tipos do formulário
interface TenantFormData {
  client_doc_cnpj: string;
  client_name: string;
  friendly_name: string;
  addr_cep: string;
  addr_addr: string;
  addr_uf: string;
  addr_number: string;
  addr_plus: string;
  addr_area: string;
  addr_city: string;
  tel1: string;
  email: string;
  free_days: number;
  waactive: boolean;
  active: number;
  // Campos do usuário (apenas para criação)
  userName: string;
  userLogin: string;
  userPassword: string;
}

interface TenantUser {
  name: string;
  login: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

const TenantDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.id as string;
  const isEditMode = !!tenantId && tenantId !== "new";

  // Estados do formulário
  const [formData, setFormData] = useState<TenantFormData>({
    client_doc_cnpj: "",
    client_name: "",
    friendly_name: "",
    addr_cep: "",
    addr_addr: "",
    addr_uf: "",
    addr_number: "",
    addr_plus: "",
    addr_area: "",
    addr_city: "",
    tel1: "",
    email: "",
    free_days: 90,
    waactive: false,
    active: 1,
    userName: "",
    userLogin: "",
    userPassword: "",
  });

  // Estados de controle
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(isEditMode);
  const [tenantName, setTenantName] = useState("");
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Gerar senha aleatória
  const generateRandomPassword = (): string => {
    const min = 10000000;
    const max = 99999999;
    return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
  };

  // Efeito para auto-preencher login quando email muda (apenas em modo criação)
  useEffect(() => {
    if (!isEditMode && formData.email) {
      setFormData((prev) => ({
        ...prev,
        userLogin: formData.email,
      }));
    }
  }, [formData.email, isEditMode]);

  // Efeito inicial para carregar dados ou configurar novo
  useEffect(() => {
    if (isEditMode) {
      loadTenant();
    } else {
      // Configurar para novo tenant
      const password = generateRandomPassword();
      setFormData((prev) => ({
        ...prev,
        userPassword: password,
      }));
      setIsLoadingPage(false);
    }
  }, [isEditMode]);

  // Carregar dados do tenant
  const loadTenant = async () => {
    try {
      setIsLoadingPage(true);
      const response = await TenantService.getTenantById(parseInt(tenantId));

      if (response.success && response.data) {
        const tenant = response.data;
        setTenantName(tenant.client_name || tenant.friendly_name || "");

        // Preencher formulário
        setFormData({
          client_doc_cnpj: tenant.client_doc_cnpj || "",
          client_name: tenant.client_name || "",
          friendly_name: tenant.friendly_name || "",
          addr_cep: tenant.addr_cep || "",
          addr_addr: tenant.addr_addr || "",
          addr_uf: tenant.addr_uf || "",
          addr_number: tenant.addr_number || "",
          addr_plus: tenant.addr_plus || "",
          addr_area: tenant.addr_area || "",
          addr_city: tenant.addr_city || "",
          tel1: tenant.tel1 || "",
          email: tenant.email || "",
          free_days: tenant.free_days || 90,
          waactive: tenant.waactive === 1,
          active: tenant.active || 1,
          userName: "",
          userLogin: "",
          userPassword: "",
        });

        // Carregar usuário principal
        await loadTenantUser();
      } else {
        setError(response.message || "Erro ao carregar tenant");
      }
    } catch (err) {
      setError("Erro interno ao carregar tenant");
      console.error("Erro ao carregar tenant:", err);
    } finally {
      setIsLoadingPage(false);
    }
  };

  // Carregar usuário principal do tenant
  const loadTenantUser = async () => {
    try {
      const response = await TenantService.getPrincipalUserByTenantId(
        parseInt(tenantId)
      );

      if (response.success && response.data) {
        setTenantUser({
          name: response.data.name,
          login: response.data.login,
          password: "********", // Não mostrar senha real
        });
      }
    } catch (err) {
      console.error("Erro ao carregar usuário do tenant:", err);
    }
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Campos obrigatórios
    if (!formData.friendly_name.trim()) {
      newErrors.friendly_name = "Nome fantasia é obrigatório";
    }

    if (!formData.tel1.trim()) {
      newErrors.tel1 = "Telefone é obrigatório";
    } else if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(formData.tel1)) {
      newErrors.tel1 = "Formato de telefone inválido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validações específicas para modo criação
    if (!isEditMode) {
      if (!formData.userName.trim()) {
        newErrors.userName = "Nome do usuário é obrigatório";
      }
      if (!formData.userLogin.trim()) {
        newErrors.userLogin = "Login é obrigatório";
      }
      if (!formData.userPassword.trim()) {
        newErrors.userPassword = "Senha é obrigatória";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (
    field: keyof TenantFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle input blur (marcar como touched)
  const handleInputBlur = (field: string) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // Aplicar máscara de telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
      value = value.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }

    handleInputChange("tel1", value);
  };

  // Submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Preparar dados para envio
      const tenantData = {
        ...formData,
        waactive: formData.waactive ? 1 : 0,
      };

      let response;
      if (isEditMode) {
        response = await TenantService.updateTenant(
          parseInt(tenantId),
          tenantData
        );
      } else {
        response = await TenantService.createTenant(tenantData);
      }

      if (response.success) {
        // TODO: Mostrar toast de sucesso
        router.push("/tenants");
      } else {
        setError(response.message || "Erro ao salvar tenant");
      }
    } catch (err) {
      setError("Erro interno do servidor");
      console.error("Erro ao salvar tenant:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Navegação
  const goToUsers = () => {
    router.push(`/tenants/${tenantId}/users`);
  };

  const goBack = () => {
    router.back();
  };

  // Loading da página
  if (isLoadingPage) {
    return (
      <ProtectedRoute requiredLevel={2}>
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <Loader2 className="w-12 h-12 animate-spin text-[#008089]" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredLevel={2}>
      <div className="p-6">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                {isEditMode ? `Editar Cliente: ${tenantName}` : "Novo Cliente"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditMode
                  ? "Edite as informações do cliente"
                  : "Cadastre um novo cliente no sistema"}
              </p>
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

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados da Empresa */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Dados da Empresa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                value={formData.client_doc_cnpj}
                onChange={(e) =>
                  handleInputChange("client_doc_cnpj", e.target.value)
                }
                onBlur={() => handleInputBlur("client_doc_cnpj")}
                error={touched.client_doc_cnpj ? errors.client_doc_cnpj : ""}
              />
              <Input
                label="Razão Social"
                placeholder="Empresa XYZ LTDA"
                value={formData.client_name}
                onChange={(e) =>
                  handleInputChange("client_name", e.target.value)
                }
                onBlur={() => handleInputBlur("client_name")}
                error={touched.client_name ? errors.client_name : ""}
              />
              <Input
                label="Nome Fantasia"
                placeholder="Nome Fantasia"
                value={formData.friendly_name}
                onChange={(e) =>
                  handleInputChange("friendly_name", e.target.value)
                }
                onBlur={() => handleInputBlur("friendly_name")}
                error={touched.friendly_name ? errors.friendly_name : ""}
                required
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Endereço
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                label="CEP"
                placeholder="00000-000"
                value={formData.addr_cep}
                onChange={(e) => handleInputChange("addr_cep", e.target.value)}
                onBlur={() => handleInputBlur("addr_cep")}
                error={touched.addr_cep ? errors.addr_cep : ""}
              />
              <Input
                label="Endereço"
                placeholder="Rua Exemplo"
                value={formData.addr_addr}
                onChange={(e) => handleInputChange("addr_addr", e.target.value)}
                onBlur={() => handleInputBlur("addr_addr")}
                error={touched.addr_addr ? errors.addr_addr : ""}
              />
              <Input
                label="Número"
                placeholder="123"
                value={formData.addr_number}
                onChange={(e) =>
                  handleInputChange("addr_number", e.target.value)
                }
                onBlur={() => handleInputBlur("addr_number")}
                error={touched.addr_number ? errors.addr_number : ""}
              />
              <Input
                label="Complemento"
                placeholder="Sala 1"
                value={formData.addr_plus}
                onChange={(e) => handleInputChange("addr_plus", e.target.value)}
                onBlur={() => handleInputBlur("addr_plus")}
                error={touched.addr_plus ? errors.addr_plus : ""}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Bairro"
                placeholder="Centro"
                value={formData.addr_area}
                onChange={(e) => handleInputChange("addr_area", e.target.value)}
                onBlur={() => handleInputBlur("addr_area")}
                error={touched.addr_area ? errors.addr_area : ""}
              />
              <Input
                label="Cidade"
                placeholder="João Pessoa"
                value={formData.addr_city}
                onChange={(e) => handleInputChange("addr_city", e.target.value)}
                onBlur={() => handleInputBlur("addr_city")}
                error={touched.addr_city ? errors.addr_city : ""}
              />
              <Input
                label="Estado (UF)"
                placeholder="PB"
                value={formData.addr_uf}
                onChange={(e) => handleInputChange("addr_uf", e.target.value)}
                onBlur={() => handleInputBlur("addr_uf")}
                error={touched.addr_uf ? errors.addr_uf : ""}
              />
            </div>
          </div>

          {/* Contato */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Telefone"
                  placeholder="(83) 99999-9999"
                  value={formData.tel1}
                  onChange={handlePhoneChange}
                  onBlur={() => handleInputBlur("tel1")}
                  error={touched.tel1 ? errors.tel1 : ""}
                  required
                />
              </div>
              <Input
                label="Email"
                type="email"
                placeholder="exemplo@email.com"
                leftIcon={<Mail className="w-4 h-4" />}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={() => handleInputBlur("email")}
                error={touched.email ? errors.email : ""}
                required
              />
            </div>
          </div>

          {/* Configurações */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Configurações
            </h3>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.waactive}
                  onChange={(e) =>
                    handleInputChange("waactive", e.target.checked)
                  }
                  className="h-5 w-5 text-[#008089] border-gray-300 rounded focus:ring-[#008089]"
                />
                <span className="text-sm text-gray-800 select-none">
                  Ativar serviço de WhatsApp
                </span>
              </label>

              {isEditMode && (
                <div className="md:w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status do Cliente
                  </label>
                  <select
                    value={formData.active}
                    onChange={(e) =>
                      handleInputChange("active", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008089] focus:border-[#008089]"
                  >
                    <option value={1}>Ativo</option>
                    <option value={3}>Inativo</option>
                    <option value={0}>Cancelado</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Usuário Principal (apenas para criação) */}
          {!isEditMode && (
            <div className="bg-white shadow-sm rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Usuário Principal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Nome do Usuário"
                  placeholder="Fulano da Silva"
                  value={formData.userName}
                  onChange={(e) =>
                    handleInputChange("userName", e.target.value)
                  }
                  onBlur={() => handleInputBlur("userName")}
                  error={touched.userName ? errors.userName : ""}
                  required
                />
                <Input
                  label="Login"
                  placeholder="Será preenchido automaticamente"
                  value={formData.userLogin}
                  readOnly
                  className="bg-gray-50"
                />
                <div className="relative">
                  <Input
                    label="Senha"
                    type={showPassword ? "text" : "password"}
                    value={formData.userPassword}
                    readOnly
                    className="bg-gray-50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Informações do Usuário (apenas para edição) */}
          {isEditMode && tenantUser && (
            <div className="bg-white shadow-sm rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Usuário Principal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Nome do Usuário"
                  value={tenantUser.name}
                  readOnly
                  className="bg-gray-50"
                />
                <Input
                  label="Login"
                  value={tenantUser.login}
                  readOnly
                  className="bg-gray-50"
                />
                <Input
                  label="Senha"
                  value={tenantUser.password}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <div className="flex flex-wrap gap-4">
              {isEditMode && (
                <Button
                  type="button"
                  onClick={goToUsers}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Usuários
                </Button>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#008089] hover:bg-[#006b73] flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isEditMode ? "Atualizar" : "Salvar"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default TenantDetailPage;
