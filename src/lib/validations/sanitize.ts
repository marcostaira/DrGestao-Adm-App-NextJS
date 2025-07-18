import validator from "validator";

export class InputSanitizer {
  /**
   * Sanitiza texto geral removendo tags HTML e caracteres perigosos
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== "string") return "";

    let sanitized = input;

    // Remove tags HTML básicas
    sanitized = sanitized.replace(/<[^>]*>/g, "");

    // Remove scripts e conteúdo perigoso
    sanitized = sanitized.replace(/javascript:/gi, "");
    sanitized = sanitized.replace(/vbscript:/gi, "");
    sanitized = sanitized.replace(/onload/gi, "");
    sanitized = sanitized.replace(/onerror/gi, "");
    sanitized = sanitized.replace(/onclick/gi, "");

    // Remove caracteres de controle
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");

    // Normaliza espaços
    sanitized = sanitized.replace(/\s+/g, " ").trim();

    return sanitized;
  }

  /**
   * Sanitiza email
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== "string") return "";

    const sanitized = this.sanitizeText(email.toLowerCase());
    return validator.isEmail(sanitized) ? sanitized : "";
  }

  /**
   * Sanitiza senha (apenas remove caracteres de controle)
   */
  static sanitizePassword(password: string): string {
    if (!password || typeof password !== "string") return "";

    // Remove apenas caracteres de controle, mantém símbolos especiais
    return password.replace(/[\x00-\x1F\x7F]/g, "");
  }

  /**
   * Sanitiza nome (permite apenas letras, espaços e alguns caracteres especiais)
   */
  static sanitizeName(name: string): string {
    if (!name || typeof name !== "string") return "";

    const sanitized = this.sanitizeText(name);

    // Permite apenas letras, espaços, hífen e apóstrofe
    return sanitized.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, "").trim();
  }

  /**
   * Sanitiza número de telefone
   */
  static sanitizePhone(phone: string): string {
    if (!phone || typeof phone !== "string") return "";

    // Remove tudo exceto dígitos, espaços, hífen, parênteses e +
    return phone.replace(/[^\d\s\-\(\)\+]/g, "").trim();
  }

  /**
   * Sanitiza entrada de busca
   */
  static sanitizeSearch(search: string): string {
    if (!search || typeof search !== "string") return "";

    const sanitized = this.sanitizeText(search);

    // Remove caracteres especiais perigosos para SQL injection
    return sanitized.replace(/['"`;\\]/g, "");
  }

  /**
   * Valida e sanitiza entrada com regras específicas
   */
  static validateAndSanitize(
    input: string,
    rules: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      type?: "email" | "password" | "name" | "phone" | "search" | "text";
    }
  ): { isValid: boolean; sanitized: string; errors: string[] } {
    const errors: string[] = [];

    if (!input || typeof input !== "string") {
      if (rules.required) errors.push("Campo obrigatório");
      return { isValid: false, sanitized: "", errors };
    }

    // Sanitiza baseado no tipo
    let sanitized = input;
    switch (rules.type) {
      case "email":
        sanitized = this.sanitizeEmail(input);
        break;
      case "password":
        sanitized = this.sanitizePassword(input);
        break;
      case "name":
        sanitized = this.sanitizeName(input);
        break;
      case "phone":
        sanitized = this.sanitizePhone(input);
        break;
      case "search":
        sanitized = this.sanitizeSearch(input);
        break;
      default:
        sanitized = this.sanitizeText(input);
    }

    // Validações
    if (rules.required && !sanitized) {
      errors.push("Campo obrigatório");
    }

    if (rules.minLength && sanitized.length < rules.minLength) {
      errors.push(`Mínimo ${rules.minLength} caracteres`);
    }

    if (rules.maxLength && sanitized.length > rules.maxLength) {
      errors.push(`Máximo ${rules.maxLength} caracteres`);
    }

    if (rules.pattern && !rules.pattern.test(sanitized)) {
      errors.push("Formato inválido");
    }

    if (rules.type === "email" && sanitized && !validator.isEmail(sanitized)) {
      errors.push("Email inválido");
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors,
    };
  }
}
