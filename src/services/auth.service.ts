import { ApiService } from './api.service';
import { AuthResponse, LoginCredentials, User } from '@/types/auth.types';
import { AuthValidation } from '@/lib/validations/auth';
import { levelToRole, getPermissionsByLevel } from '@/lib/auth/permissions';

// Tipo da resposta da API baseado na estrutura do DB
interface ApiUserResponse {
  id: number;
  name: string;
  email: string;
  login: string;
  active: number; // tinyint(1) vem como number
  level: number;
}

interface ApiAuthResponse {
  token: string;
  refreshToken?: string;
  user: ApiUserResponse;
}

export class AuthService {
  /**
   * Realiza login com validação e sanitização
   */
  static async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    data?: AuthResponse;
    message?: string;
    errors?: Record<string, string[]>;
  }> {
    // Validar e sanitizar dados de entrada
    const validation = AuthValidation.validateLogin({
      login: credentials.email, // Pode ser email ou login
      pwd: credentials.password
    });

    if (!validation.isValid) {
      return {
        success: false,
        message: 'Dados inválidos',
        errors: validation.errors
      };
    }

    try {
      console.log('🔐 Tentando login com:', { login: validation.sanitizedData.login });
      
      // Fazer requisição para a API
      const response = await ApiService.post<ApiAuthResponse>('/auth/login', validation.sanitizedData);

      console.log('📨 Resposta da API:', response);

      if (response.success && response.data) {
        console.log('👤 Dados do usuário recebidos:', response.data.user);
        console.log('🔍 Verificando campo active:', {
          valor: response.data.user.active,
          tipo: typeof response.data.user.active
        });
        
        // Verificar se usuário está ativo
        const activeValue = response.data.user.active;
        
        // Se active não existe na resposta, assumir que está ativo (fallback)
        // Em produção, você deve ajustar sua API para retornar o campo active
        const activeStatus = activeValue === undefined ? true : 
                            (typeof activeValue === 'number' && activeValue === 1) || 
                            (typeof activeValue === 'string' && activeValue === '1');
        
        console.log('🔍 Resultado da verificação:', { 
          activeStatus,
          observacao: activeValue === undefined ? 'Campo active não existe - assumindo ativo' : 'Campo active verificado'
        });
        
        if (!activeStatus) {
          console.log('❌ Usuário rejeitado - campo active:', response.data.user.active);
          return {
            success: false,
            message: 'Usuário inativo. Entre em contato com o administrador.'
          };
        }

        console.log('✅ Usuário ativo verificado, prosseguindo...');

        // Converter dados da API para formato interno
        const user: User = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          login: response.data.user.login || response.data.user.email, // Fallback se login não existir
          active: activeStatus, // Usar o status calculado
          level: response.data.user.level,
          role: levelToRole(response.data.user.level),
          permissions: getPermissionsByLevel(response.data.user.level)
        };

        console.log('🔄 Usuário convertido para formato interno:', user);

        const authResponse: AuthResponse = {
          token: response.data.token,
          refreshToken: response.data.refreshToken || '',
          user
        };

        // Salvar token no localStorage
        ApiService.setAuthToken(authResponse.token);
        
        // Salvar refresh token se existir
        if (authResponse.refreshToken) {
          localStorage.setItem('refresh_token', authResponse.refreshToken);
        }

        // Salvar dados do usuário
        localStorage.setItem('user_data', JSON.stringify(user));

        return {
          success: true,
          data: authResponse,
          message: 'Login realizado com sucesso'
        };
      }

      return {
        success: false,
        message: response.message || 'Login ou senha incorretos',
        errors: response.errors
      };

    } catch (error) {
      return {
        success: false,
        message: 'Erro de conexão. Tente novamente.'
      };
    }
  }

  /**
   * Realiza logout
   */
  static async logout(): Promise<void> {
    try {
      // Opcional: notificar servidor sobre logout
      await ApiService.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao notificar logout:', error);
    } finally {
      // Limpar dados locais
      ApiService.removeAuthToken();
      localStorage.removeItem('user_data');
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    const tokenValidation = AuthValidation.validateToken(token);
    return tokenValidation.isValid;
  }

  /**
   * Obtém dados do usuário logado
   */
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) return null;
      
      const user = JSON.parse(userData);
      
      // Garantir que permissions sempre existe
      if (!user.permissions) {
        user.permissions = [];
      }
      
      // Garantir que active seja boolean correto baseado no valor do DB
      // No DB: 1 = ativo, 0 = inativo (pode vir como number ou string)
      if (typeof user.active === 'number') {
        user.active = user.active === 1;
      } else if (typeof user.active === 'string') {
        user.active = user.active === '1';
      } else if (typeof user.active !== 'boolean') {
        user.active = false; // Fallback para false se não conseguir determinar
      }
      
      return user;
    } catch {
      return null;
    }
  }

  /**
   * Verifica se usuário tem permissão específica
   */
  static hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.active) return false; // user.active já é boolean (true/false)

    // Super admin (level 1) tem todas as permissões
    if (user.level === 1) return true;

    // Verificar permissões específicas
    return user.permissions.includes(permission);
  }

  /**
   * Verifica se usuário tem level específico ou superior
   */
  static hasLevel(requiredLevel: number): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.active) return false; // user.active já é boolean (true/false)

    // Level menor = mais poder (1 = super admin, 4 = user)
    return user.level <= requiredLevel;
  }

  /**
   * Verifica se usuário tem papel específico
   */
  static hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role && user.active === true; // Verificação explícita
  }

  /**
   * Verifica se usuário pode acessar determinada área
   */
  static canAccess(area: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.active) return false; // user.active já é boolean (true/false)

    // Mapeamento de áreas por level
    const areaAccess: Record<string, number> = {
      'dashboard': 4,        // Todos podem ver dashboard
      'users': 2,           // Apenas admin e super-admin
      'settings': 2,        // Apenas admin e super-admin  
      'reports': 3,         // Operator e acima
      'logs': 2,            // Apenas admin e super-admin
      'system': 1           // Apenas super-admin
    };

    const requiredLevel = areaAccess[area] || 4;
    return this.hasLevel(requiredLevel);
  }

  /**
   * Atualiza token (implementar quando tiver endpoint de refresh)
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await ApiService.post<{ token: string }>('/auth/refresh', {
        refreshToken
      });

      if (response.success && response.data) {
        ApiService.setAuthToken(response.data.token);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}