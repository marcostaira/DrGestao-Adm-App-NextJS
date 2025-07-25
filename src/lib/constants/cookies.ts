// Constantes para gerenciamento de cookies
export const COOKIE_NAMES = {
  DEVICE_TRUST: "device_trust_token",
  PERSISTENT_LOGIN: "persistent_login_token",
} as const;

export const COOKIE_DURATIONS = {
  DEVICE_TRUST_DAYS: 30,
  PERSISTENT_LOGIN_DAYS: 7,
} as const;

export const COOKIE_OPTIONS = {
  secure: true,
  sameSite: "strict" as const,
  path: "/",
} as const;
