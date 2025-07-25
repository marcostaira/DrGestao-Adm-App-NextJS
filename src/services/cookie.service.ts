export class CookieService {
  private static readonly DEVICE_TRUST_COOKIE = 'device_trust';
  private static readonly PERSISTENT_LOGIN_COOKIE = 'persistent_login';
  
  /**
   * Gerar ID único do dispositivo baseado em características do browser
   */
  static generateDeviceId(): string {
    const navigator = window.navigator;
    const screen = window.screen;
    
    const deviceInfo = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ].join('|');

    // Hash simples (em produção, use crypto.subtle)
    let hash = 0;
    for (let i = 0; i < deviceInfo.length; i++) {
      const char = deviceInfo.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para 32bit
    }
    
    return Math.abs(hash).toString(36) + Date.now().toString(36);
  }

  /**
   * Definir cookie de dispositivo confiável (30 dias)
   */
  static setDeviceTrustCookie(userId: number): string {
    const deviceId = this.generateDeviceId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 dias

    const cookieValue = JSON.stringify({
      deviceId,
      userId,
      expiresAt: expiresAt.toISOString()
    });

    document.cookie = `${this.DEVICE_TRUST_COOKIE}=${encodeURIComponent(cookieValue)}; ` +
      `expires=${expiresAt.toUTCString()}; ` +
      `path=/; ` +
      `secure; ` +
      `samesite=strict`;

    console.log('🍪 Cookie de dispositivo confiável definido por 30 dias');
    return deviceId;
  }

  /**
   * Definir cookie de login persistente (7 dias)
   */
  static setPersistentLoginCookie(token: string): void {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    document.cookie = `${this.PERSISTENT_LOGIN_COOKIE}=${encodeURIComponent(token)}; ` +
      `expires=${expiresAt.toUTCString()}; ` +
      `path=/; ` +
      `secure; ` +
      `samesite=strict`;

    console.log('🍪 Cookie de login persistente definido por 7 dias');
  }

  /**
   * Obter cookie de dispositivo confiável
   */
  static getDeviceTrustCookie(): { deviceId: string; userId: number; expiresAt: string } | null {
    const cookies = document.cookie.split(';');
    const deviceCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${this.DEVICE_TRUST_COOKIE}=`)
    );

    if (!deviceCookie) return null;

    try {
      const cookieValue = decodeURIComponent(
        deviceCookie.split('=')[1]
      );
      const data = JSON.parse(cookieValue);
      
      // Verificar se não expirou
      if (new Date(data.expiresAt) < new Date()) {
        this.removeDeviceTrustCookie();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao ler cookie de dispositivo:', error);
      this.removeDeviceTrustCookie();
      return null;
    }
  }

  /**
   * Obter cookie de login persistente
   */
  static getPersistentLoginCookie(): string | null {
    const cookies = document.cookie.split(';');
    const loginCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${this.PERSISTENT_LOGIN_COOKIE}=`)
    );

    if (!loginCookie) return null;

    try {
      return decodeURIComponent(loginCookie.split('=')[1]);
    } catch (error) {
      console.error('Erro ao ler cookie de login persistente:', error);
      this.removePersistentLoginCookie();
      return null;
    }
  }

  /**
   * Verificar se dispositivo é confiável para um usuário
   */
  static isDeviceTrusted(userId: number): boolean {
    const deviceTrust = this.getDeviceTrustCookie();
    return deviceTrust !== null && deviceTrust.userId === userId;
  }

  /**
   * Remover cookie de dispositivo confiável
   */
  static removeDeviceTrustCookie(): void {
    document.cookie = `${this.DEVICE_TRUST_COOKIE}=; ` +
      `expires=Thu, 01 Jan 1970 00:00:00 UTC; ` +
      `path=/; ` +
      `secure; ` +
      `samesite=strict`;

    console.log('🍪 Cookie de dispositivo confiável removido');
  }

  /**
   * Remover cookie de login persistente
   */
  static removePersistentLoginCookie(): void {
    document.cookie = `${this.PERSISTENT_LOGIN_COOKIE}=; ` +
      `expires=Thu, 01 Jan 1970 00:00:00 UTC; ` +
      `path=/; ` +
      `secure; ` +
      `samesite=strict`;

    console.log('🍪 Cookie de login persistente removido');
  }

  /**
   * Limpar todos os cookies de autenticação
   */
  static clearAuthCookies(): void {
    this.removeDeviceTrustCookie();
    this.removePersistentLoginCookie();
    console.log('🍪 Todos os cookies de autenticação removidos');
  }

  /**
   * Obter informações do dispositivo atual
   */
  static getDeviceInfo(): { userAgent: string; ipAddress: string } {
    return {
      userAgent: navigator.userAgent,
      ipAddress: 'client-side' // IP será obtido no servidor
    };
  }
}