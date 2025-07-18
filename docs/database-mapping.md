# Mapeamento da Tabela gas_admusr

## Estrutura do Banco de Dados

```sql
CREATE TABLE `gas_admusr` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `login` varchar(255) DEFAULT NULL,
  `pwd` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '0',  -- 0 = Inativo, 1 = Ativo
  `level` tinyint(1) DEFAULT '3',   -- 1 = Super Admin, 2 = Admin, 3 = Operator, 4 = User
  PRIMARY KEY (`id`)
)
```

## Mapeamento de Campos

### Campo `active`
- **Banco de Dados**: `tinyint(1)` 
  - `0` = Usuário Inativo
  - `1` = Usuário Ativo
- **Frontend**: `boolean`
  - `false` = Usuário Inativo
  - `true` = Usuário Ativo

### Campo `level`
- **Banco de Dados**: `tinyint(1)`
  - `1` = Super Administrador (todas as permissões)
  - `2` = Administrador (usuários, relatórios, configurações)
  - `3` = Operador (visualização e operações básicas)
  - `4` = Usuário (apenas dashboard e perfil)

## Sistema de Permissões

### Hierarquia de Levels
Quanto menor o número, maior o poder:
- Level 1 (Super Admin) > Level 2 (Admin) > Level 3 (Operator) > Level 4 (User)

### Mapeamento de Áreas
- **Dashboard**: Level 4+ (todos)
- **Usuários**: Level 2+ (admin e super-admin)
- **Relatórios**: Level 3+ (operator e acima)
- **Configurações**: Level 2+ (admin e super-admin)
- **Logs**: Level 2+ (admin e super-admin)
- **Sistema**: Level 1 (apenas super-admin)

## Conversões na Aplicação

### Login (AuthService)
```typescript
// Verificação de usuário ativo
if (response.data.user.active !== 1) {
  return { success: false, message: 'Usuário inativo' };
}

// Conversão para formato interno
const user: User = {
  // ...outros campos
  active: response.data.user.active === 1, // Converte 1/0 para true/false
  level: response.data.user.level
};
```

### Verificação de Permissões
```typescript
// Verificar se usuário está ativo
if (!user || !user.active) return false;

// Verificar level (menor = mais poder)
return user.level <= requiredLevel;
```