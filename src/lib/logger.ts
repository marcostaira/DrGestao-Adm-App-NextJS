/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/logger.ts
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogContext {
  userId?: number;
  sessionId?: string;
  component?: string;
  action?: string;
  timestamp?: string;
  url?: string;
  userAgent?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Máximo de logs em memória
  private isProduction = process.env.NODE_ENV === "production";

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Obter contexto base do usuário e sessão
   */
  private getBaseContext(): LogContext {
    const context: LogContext = {
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    };

    // Tentar obter dados do usuário logado
    try {
      if (typeof window !== "undefined") {
        const authData = localStorage.getItem("auth_token");
        if (authData) {
          // Extrair userId do token se possível
          context.sessionId = this.generateSessionId();
        }
      }
    } catch (error) {
      // Ignorar erros de localStorage
    }

    return context;
  }

  /**
   * Gerar ID de sessão único
   */
  private generateSessionId(): string {
    if (typeof window !== "undefined") {
      let sessionId = sessionStorage.getItem("log_session_id");
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        sessionStorage.setItem("log_session_id", sessionId);
      }
      return sessionId;
    }
    return `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Criar entrada de log
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const baseContext = this.getBaseContext();
    const mergedContext = { ...baseContext, ...context };

    const logEntry: LogEntry = {
      level,
      message,
      context: mergedContext,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return logEntry;
  }

  /**
   * Adicionar log à lista interna
   */
  private addLog(logEntry: LogEntry): void {
    this.logs.push(logEntry);

    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Enviar log para console com formatação
   */
  private logToConsole(logEntry: LogEntry): void {
    const { level, message, context, error } = logEntry;
    const prefix = `[${logEntry.timestamp}] [${level.toUpperCase()}]`;

    const logData = {
      message,
      context,
      ...(error && { error }),
    };

    switch (level) {
      case "debug":
        console.debug(prefix, message, logData);
        break;
      case "info":
        console.info(prefix, message, logData);
        break;
      case "warn":
        console.warn(prefix, message, logData);
        break;
      case "error":
      case "fatal":
        console.error(prefix, message, logData);
        break;
    }
  }

  /**
   * Enviar logs para serviço externo (em produção)
   */
  private async sendToExternalService(logEntry: LogEntry): Promise<void> {
    if (!this.isProduction) return;

    try {
      // Aqui você pode integrar com serviços como:
      // - Sentry
      // - LogRocket
      // - DataDog
      // - New Relic
      // - Ou sua própria API de logs

      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      // Não fazer log do erro para evitar recursão infinita
      console.error("Falha ao enviar log para serviço externo:", error);
    }
  }

  /**
   * Método principal de logging
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    const logEntry = this.createLogEntry(level, message, context, error);

    this.addLog(logEntry);
    this.logToConsole(logEntry);

    // Enviar para serviço externo apenas para erros em produção
    if (level === "error" || level === "fatal") {
      this.sendToExternalService(logEntry);
    }
  }

  /**
   * Métodos públicos de logging
   */
  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log("error", message, context, error);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log("fatal", message, context, error);
  }

  /**
   * Log para ações específicas da aplicação
   */
  userAction(action: string, context?: LogContext): void {
    this.info(`Ação do usuário: ${action}`, {
      ...context,
      action,
      component: context?.component || "unknown",
    });
  }

  apiCall(
    method: string,
    endpoint: string,
    statusCode?: number,
    context?: LogContext
  ): void {
    const level = statusCode && statusCode >= 400 ? "error" : "info";
    this.log(level, `API ${method} ${endpoint} - Status: ${statusCode}`, {
      ...context,
      method,
      endpoint,
      statusCode,
    });
  }

  pageView(page: string, context?: LogContext): void {
    this.info(`Página visualizada: ${page}`, {
      ...context,
      page,
      action: "page_view",
    });
  }

  /**
   * Obter logs armazenados
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Limpar logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Exportar logs como JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instância singleton
export const logger = Logger.getInstance();

// Hook para usar o logger em componentes React
export function useLogger(componentName?: string) {
  const logWithComponent = (
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ) => {
    const mergedContext = {
      ...context,
      component: componentName || context?.component,
    };

    switch (level) {
      case "debug":
        logger.debug(message, mergedContext);
        break;
      case "info":
        logger.info(message, mergedContext);
        break;
      case "warn":
        logger.warn(message, mergedContext);
        break;
      case "error":
        logger.error(message, error, mergedContext);
        break;
      case "fatal":
        logger.fatal(message, error, mergedContext);
        break;
    }
  };

  return {
    debug: (message: string, context?: LogContext) =>
      logWithComponent("debug", message, context),
    info: (message: string, context?: LogContext) =>
      logWithComponent("info", message, context),
    warn: (message: string, context?: LogContext) =>
      logWithComponent("warn", message, context),
    error: (message: string, error?: Error, context?: LogContext) =>
      logWithComponent("error", message, context, error),
    fatal: (message: string, error?: Error, context?: LogContext) =>
      logWithComponent("fatal", message, context, error),
    userAction: (action: string, context?: LogContext) =>
      logger.userAction(action, { ...context, component: componentName }),
    pageView: (page: string, context?: LogContext) =>
      logger.pageView(page, { ...context, component: componentName }),
  };
}
