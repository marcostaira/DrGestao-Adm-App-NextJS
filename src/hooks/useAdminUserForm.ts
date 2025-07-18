/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminUsersService, AdminUser, CreateAdminUserData, UpdateAdminUserData } from '@/services/admin-users.service';
import { InputSanitizer } from '@/lib/validations/sanitize';

export interface AdminUserFormData {
  name: string;
  email: string;
  login: string;
  level: number;
  active: boolean;
  pwd: string;
  confirmPassword: string;
}

export interface FormErrors {
  name?: string[];
  email?: string[];
  login?: string[];
  level?: string[];
  active?: string[];
  pwd?: string[];
  confirmPassword?: string[];
  general?: string[];
}

export function useAdminUserForm(userId?: string) {
  const router = useRouter();
  const isEditing = !!userId;
  
  const [formData, setFormData] = useState<AdminUserFormData>({
    name: '',
    email: '',
    login: '',
    level: 2,
    active: true,
    pwd: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Carregar usuário para edição
  useEffect(() => {
    if (isEditing && userId) {
      loadUser(parseInt(userId));
    }
  }, [isEditing, userId]);

  const loadUser = async (id: number) => {
    setLoading(true);
    setLoadError(null);

    const response = await AdminUsersService.getUserById(id);

    if (response.success && response.data) {
      const user = response.data;
      setFormData({
        name: user.name,
        email: user.email,
        login: user.login,
        level: user.level,
        active: user.active === 1,
        pwd: '',
        confirmPassword: ''
      });
    } else {
      setLoadError(response.message || 'Erro ao carregar usuário');
    }

    setLoading(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nome
    const nameValidation = InputSanitizer.validateAndSanitize(formData.name, {
      required: true,
      minLength: 2,
      maxLength: 255,
      type: 'name'
    });
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.errors;
    }

    // Validar email
    const emailValidation = InputSanitizer.validateAndSanitize(formData.email, {
      required: true,
      type: 'email'
    });
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors;
    }

    // Validar login
    const loginValidation = InputSanitizer.validateAndSanitize(formData.login, {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_.-]+$/
    });
    if (!loginValidation.isValid) {
      newErrors.login = loginValidation.errors;
    }

    // Validar level
    if (!formData.level || ![1, 2, 3, 4].includes(formData.level)) {
      newErrors.level = ['Nível de acesso é obrigatório'];
    }

    // Validar senha (apenas para novos usuários ou se preenchida)
    if (!isEditing || formData.pwd) {
      const pwdValidation = InputSanitizer.validateAndSanitize(formData.pwd, {
        required: !isEditing,
        minLength: 6,
        maxLength: 128,
        type: 'password'
      });
      if (!pwdValidation.isValid) {
        newErrors.pwd = pwdValidation.errors;
      }

      // Validar confirmação de senha
      if (formData.pwd !== formData.confirmPassword) {
        newErrors.confirmPassword = ['Senhas não coincidem'];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<{ success: boolean; message?: string }> => {
    if (!validateForm()) {
      return { success: false, message: 'Verifique os dados informados' };
    }

    setSaving(true);

    try {
      // Sanitizar dados
      const sanitizedData = {
        name: InputSanitizer.sanitizeName(formData.name),
        email: InputSanitizer.sanitizeEmail(formData.email),
        login: InputSanitizer.sanitizeText(formData.login),
        level: formData.level,
        active: formData.active ? 1 : 0
      };

      // Adicionar senha apenas se informada
      const dataWithPassword = formData.pwd ? {
        ...sanitizedData,
        pwd: InputSanitizer.sanitizePassword(formData.pwd)
      } : sanitizedData;

      let response;

      if (isEditing && userId) {
        response = await AdminUsersService.updateUser(
          parseInt(userId), 
          dataWithPassword as UpdateAdminUserData
        );
      } else {
        response = await AdminUsersService.createUser(
          dataWithPassword as CreateAdminUserData
        );
      }

      if (response.success) {
        const message = isEditing 
          ? 'Usuário atualizado com sucesso!' 
          : 'Usuário criado com sucesso!';
        
        // Navegar de volta para listagem
        router.push('/admin-users');
        
        return { success: true, message };
      } else {
        return { 
          success: false, 
          message: response.message || (isEditing ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário')
        };
      }

    } catch (error) {
      return { 
        success: false, 
        message: 'Erro inesperado. Tente novamente.' 
      };
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin-users');
  };

  const updateField = (field: keyof AdminUserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return {
    formData,
    errors,
    loading,
    saving,
    loadError,
    isEditing,
    updateField,
    handleSubmit,
    handleCancel
  };
}