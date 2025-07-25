"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberDevice: false,
    rememberLogin: false,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setMessage("Login realizado com sucesso!");

      // TODO: Implementar cookies quando OTP estiver ativo
      if (formData.rememberDevice) {
        console.log("🍪 Salvaria cookie de dispositivo confiável por 30 dias");
      }

      if (formData.rememberLogin) {
        console.log("🍪 Salvaria cookie de login persistente por 7 dias");
      }

      router.push("/dashboard");
    } else {
      if (result.errors) {
        setErrors(result.errors);
      }
      if (result.message) {
        setMessage(result.message);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: [],
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Área Administrativa
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login para acessar o painel
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email ou Login"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Digite seu email ou login"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.login}
              disabled={isLoading}
            />

            <Input
              label="Senha"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Digite sua senha"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              error={errors.pwd}
              disabled={isLoading}
            />
          </div>

          {/* Opções de lembrar */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="rememberDevice"
                name="rememberDevice"
                type="checkbox"
                checked={formData.rememberDevice}
                onChange={handleChange}
                disabled={isLoading}
                className="h-4 w-4 text-[#008089] focus:ring-[#008089] border-gray-300 rounded"
              />
              <label
                htmlFor="rememberDevice"
                className="ml-2 block text-sm text-gray-700"
              >
                Confiar neste dispositivo{" "}
                <span className="text-gray-500">
                  (não solicitar verificação por 30 dias)
                </span>
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="rememberLogin"
                name="rememberLogin"
                type="checkbox"
                checked={formData.rememberLogin}
                onChange={handleChange}
                disabled={isLoading}
                className="h-4 w-4 text-[#008089] focus:ring-[#008089] border-gray-300 rounded"
              />
              <label
                htmlFor="rememberLogin"
                className="ml-2 block text-sm text-gray-700"
              >
                Manter conectado{" "}
                <span className="text-gray-500">(por 7 dias)</span>
              </label>
            </div>
          </div>

          {/* Informações sobre as opções */}
          {(formData.rememberDevice || formData.rememberLogin) && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="text-xs text-blue-700 space-y-1">
                {formData.rememberDevice && (
                  <div>
                    <strong>🛡️ Dispositivo Confiável:</strong> Este dispositivo
                    será lembrado por 30 dias. Você não precisará inserir código
                    de verificação em futuros logins.
                  </div>
                )}
                {formData.rememberLogin && (
                  <div>
                    <strong>🔄 Login Persistente:</strong> Você permanecerá
                    logado por até 7 dias, mesmo fechando o navegador.
                  </div>
                )}
              </div>
            </div>
          )}

          {errors.general && (
            <div className="text-red-600 text-sm text-center">
              {errors.general.join(", ")}
            </div>
          )}

          {message && (
            <div
              className={`text-sm text-center ${
                message.includes("sucesso") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#008089] hover:bg-[#006b73]"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>

          {/* Informações de segurança */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              🔒 Suas informações são protegidas com criptografia SSL
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
