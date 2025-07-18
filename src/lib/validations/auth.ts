import { InputSanitizer } from './sanitize';

export interface LoginValidationResult {
  isValid: boolean;
  sanitizedData: {
    login: string;
    pwd: string;
  };
  errors: {
    login?: string[];
    pwd?: string[];
    general?: string[];
  };
}

export interface ChangePasswordValidationResult {
  isValid: boolean;
  sanitizedData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  errors: {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
    general?: string[];
  };
}

export class AuthValidation {
  /**
   * Valida dados de login baseado no endpoint POST /auth/login
   * Campos: login, pwd
   */
  static validateLogin(data: { login: string; pwd: string }): LoginValidationResult {
    const errors: LoginValidationResult['errors'] = {};
    
    // Validar e sanitizar login (pode ser email ou username)
    const loginResult = InputSanitizer.validateAndSanitize(data.login, {
      required: true,
      minLength: 3,
      maxLength: 100,
      type: 'email' // Primeiro tenta como email
    });

    // Se não for email válido, tenta como username
    if (!loginResult.isValid && data.login) {
      const usernameResult = InputSanitizer.validateAndSanitize(data.login, {
        required: true,
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_.-]+$/,
        type: 'text'
      });
      
      if (usernameResult.isValid) {
        loginResult.isValid = true;
        loginResult.sanitized = usernameResult.sanitized;
        loginResult.errors = [];
      }
    }

    if (!loginResult.isValid) {
      errors.login = loginResult.errors.length > 0 
        ? loginResult.errors 
        : ['Login deve ser um email válido ou username (3-50 caracteres)'];
    }

    // Validar e sanitizar senha
    const passwordResult = InputSanitizer.validateAndSanitize(data.pwd, {
      required: true,
      minLength: 6,
      maxLength: 128,
      type: 'password'
    });

    if (!passwordResult.isValid) {
      errors.pwd = passwordResult.errors.length > 0 
        ? passwordResult.errors 
        : ['Senha deve ter entre 6 e 128 caracteres'];
    }

    // Validações adicionais de segurança
    if (data.login && data.pwd && data.login === data.pwd) {
      errors.general = ['Login e senha não podem ser iguais'];
    }

    // Verificar se há tentativas de SQL injection
    const sqlInjectionPattern = /('|('')|;|--|\/\*|\*\/|xp_|sp_|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)/i;
    
    if (sqlInjectionPattern.test(data.login) || sqlInjectionPattern.test(data.pwd)) {
      errors.general = ['Caracteres não permitidos detectados'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      sanitizedData: {
        login: loginResult.sanitized,
        pwd: passwordResult.sanitized
      },
      errors
    };
  }

  /**
   * Valida dados de alteração de senha
   */
  static validateChangePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): ChangePasswordValidationResult {
    const errors: ChangePasswordValidationResult['errors'] = {};

    // Validar senha atual
    const currentPasswordResult = InputSanitizer.validateAndSanitize(data.currentPassword, {
      required: true,
      minLength: 1,
      maxLength: 128,
      type: 'password'
    });

    if (!currentPasswordResult.isValid) {
      errors.currentPassword = ['Senha atual é obrigatória'];
    }

    // Validar nova senha
    const newPasswordResult = InputSanitizer.validateAndSanitize(data.newPassword, {
      required: true,
      minLength: 8,
      maxLength: 128,
      type: 'password'
    });

    if (!newPasswordResult.isValid) {
      errors.newPassword = ['Nova senha deve ter pelo menos 8 caracteres'];
    }

    // Validações adicionais da nova senha
    if (data.newPassword) {
      const passwordStrengthErrors = this.validatePasswordStrength(data.newPassword);
      if (passwordStrengthErrors.length > 0) {
        errors.newPassword = [...(errors.newPassword || []), ...passwordStrengthErrors];
      }
    }

    // Validar confirmação de senha
    const confirmPasswordResult = InputSanitizer.validateAndSanitize(data.confirmPassword, {
      required: true,
      minLength: 1,
      maxLength: 128,
      type: 'password'
    });

    if (!confirmPasswordResult.isValid) {
      errors.confirmPassword = ['Confirmação de senha é obrigatória'];
    }

    // Verificar se senhas coincidem
    if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = ['Senhas não coincidem'];
    }

    // Verificar se nova senha é diferente da atual
    if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
      errors.newPassword = ['Nova senha deve ser diferente da senha atual'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      sanitizedData: {
        currentPassword: currentPasswordResult.sanitized,
        newPassword: newPasswordResult.sanitized,
        confirmPassword: confirmPasswordResult.sanitized
      },
      errors
    };
  }

  /**
   * Valida força da senha
   */
  private static validatePasswordStrength(password: string): string[] {
    const errors: string[] = [];

    // Pelo menos uma letra minúscula
    if (!/[a-z]/.test(password)) {
      errors.push('Deve conter pelo menos uma letra minúscula');
    }

    // Pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(password)) {
      errors.push('Deve conter pelo menos uma letra maiúscula');
    }

    // Pelo menos um número
    if (!/\d/.test(password)) {
      errors.push('Deve conter pelo menos um número');
    }

    // Pelo menos um caractere especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Deve conter pelo menos um caractere especial');
    }

    // Verificar padrões comuns fracos
    const weakPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /login/i
    ];

    if (weakPatterns.some(pattern => pattern.test(password))) {
      errors.push('Senha muito comum, escolha uma mais segura');
    }

    return errors;
  }

  /**
   * Valida token JWT
   */
  static validateToken(token: string): { isValid: boolean; error?: string } {
    if (!token || typeof token !== 'string') {
      return { isValid: false, error: 'Token não fornecido' };
    }

    // Verificar formato JWT básico
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return { isValid: false, error: 'Formato de token inválido' };
    }

    // Verificar se não está expirado (verificação básica)
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return { isValid: false, error: 'Token expirado' };
      }
    } catch {
      return { isValid: false, error: 'Token malformado' };
    }

    return { isValid: true };
  }
}