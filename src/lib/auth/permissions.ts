import { UserRole, LEVEL_TO_ROLE } from '@/types/auth.types';

/**
 * Mapeamento de permissões baseado no level do usuário
 */
export const LEVEL_PERMISSIONS: Record<number, string[]> = {
  1: [
    // Super Admin - Todas as permissões
    '*'
  ],
  2: [
    // Admin
    'users.read',
    'users.write', 
    'users.delete',
    'dashboard.read',
    'reports.read',
    'reports.write',
    'settings.read',
    'settings.write',
    'logs.read'
  ],
  3: [
    // Operator
    'users.read',
    'users.write',
    'dashboard.read',
    'reports.read',
    'settings.read'
  ],
  4: [
    // User
    'dashboard.read',
    'profile.read',
    'profile.write'
  ]
};

/**
 * Converte level numérico para role string
 */
export function levelToRole(level: number): UserRole {
  return LEVEL_TO_ROLE[level] || 'user';
}

/**
 * Obtém permissões baseadas no level
 */
export function getPermissionsByLevel(level: number): string[] {
  return LEVEL_PERMISSIONS[level] || LEVEL_PERMISSIONS[4];
}

/**
 * Verifica se usuário tem permissão específica
 */
export function hasPermission(userLevel: number, permission: string): boolean {
  const permissions = getPermissionsByLevel(userLevel);
  
  // Super admin tem todas as permissões
  if (permissions.includes('*')) {
    return true;
  }
  
  return permissions.includes(permission);
}

/**
 * Verifica se usuário pode acessar determinado level
 */
export function canAccessLevel(userLevel: number, requiredLevel: number): boolean {
  // Level menor = mais poder (1 = super admin, 4 = user)
  return userLevel <= requiredLevel;
}

/**
 * Obtém descrição do level
 */
export function getLevelDescription(level: number): string {
  const descriptions: Record<number, string> = {
    1: 'Super Administrador',
    2: 'Administrador',
    3: 'Operador',
    4: 'Usuário'
  };
  
  return descriptions[level] || 'Usuário';
}