import { COOKIE_NAMES, COOKIE_DURATIONS } from "@/lib/constants/cookies";

export class SimpleCookieHelper {
  /**
   * Definir cookie de login persistente (7 dias)
   */
  static setPersistentLogin(token: string): void {
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + COOKIE_DURATIONS.PERSISTENT_LOGIN_DAYS
    );

    document.cookie =
      `${COOKIE_NAMES.PERSISTENT_LOGIN}=${encodeURIComponent(token)}; ` +
      `expires=${expiresAt.toUTCString()}; ` +
      `path=/; ` +
      `secure; ` +
      `samesite=strict`;

    console.log("🍪 Cookie de login persistente salvo por 7 dias");
  }

  /**
   * Definir cookie de dispositivo confiável (30 dias)
   */
  static setDeviceTrust(userId: number): void {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + COOKIE_DURATIONS.DEVICE_TRUST_DAYS);

    const deviceData = {
      userId,
      deviceId: this.generateSimpleDeviceId(),
      createdAt: new Date().toISOString(),
    };

    document.cookie =
      `${COOKIE_NAMES.DEVICE_TRUST}=${encodeURIComponent(
        JSON.stringify(deviceData)
      )}; ` +
      `expires=${expiresAt.toUTCString()}; ` +
      `path=/; ` +
      `secure; ` +
      `samesite=strict`;

    console.log("🍪 Cookie de dispositivo confiável salvo por 30 dias");
  }

  /**
   * Obter cookie de login persistente
   */
  static getPersistentLogin(): string | null {
    const cookies = document.cookie.split(";");
    const loginCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${COOKIE_NAMES.PERSISTENT_LOGIN}=`)
    );

    if (!loginCookie) return null;

    try {
      return decodeURIComponent(loginCookie.split("=")[1]);
    } catch {
      return null;
    }
  }

  /**
   * Obter cookie de dispositivo confiável
   */
  static getDeviceTrust(): { userId: number; deviceId: string } | null {
    const cookies = document.cookie.split(";");
    const deviceCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${COOKIE_NAMES.DEVICE_TRUST}=`)
    );

    if (!deviceCookie) return null;

    try {
      const data = JSON.parse(decodeURIComponent(deviceCookie.split("=")[1]));
      return {
        userId: data.userId,
        deviceId: data.deviceId,
      };
    } catch {
      return null;
    }
  }

  /**
   * Verificar se dispositivo é confiável para usuário
   */
  static isDeviceTrusted(userId: number): boolean {
    const deviceTrust = this.getDeviceTrust();
    return deviceTrust !== null && deviceTrust.userId === userId;
  }

  /**
   * Limpar todos os cookies de autenticação
   */
  static clearAuthCookies(): void {
    // Remover cookie de login persistente
    document.cookie =
      `${COOKIE_NAMES.PERSISTENT_LOGIN}=; ` +
      `expires=Thu, 01 Jan 1970 00:00:00 UTC; ` +
      `path=/; secure; samesite=strict`;

    // Remover cookie de dispositivo confiável
    document.cookie =
      `${COOKIE_NAMES.DEVICE_TRUST}=; ` +
      `expires=Thu, 01 Jan 1970 00:00:00 UTC; ` +
      `path=/; secure; samesite=strict`;

    console.log("🍪 Todos os cookies de autenticação removidos");
  }

  /**
   * Gerar ID simples do dispositivo
   */
  private static generateSimpleDeviceId(): string {
    const userAgent = navigator.userAgent;
    const screen = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const deviceString = `${userAgent}-${screen}-${timezone}`;

    // Hash simples
    let hash = 0;
    for (let i = 0; i < deviceString.length; i++) {
      const char = deviceString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(36) + Date.now().toString(36);
  }
}
