export interface OTPRequest {
  login: string;
  pwd: string;
  rememberDevice?: boolean;
  rememberLogin?: boolean;
}

export interface OTPResponse {
  requiresOtp: boolean;
  otpSent?: boolean;
  tempToken?: string; // Token temporário para validar OTP
  message?: string;
}

export interface OTPValidation {
  tempToken: string;
  otpCode: string;
  rememberDevice?: boolean;
  rememberLogin?: boolean;
}

export interface DeviceTrust {
  deviceId: string;
  userId: number;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CookieOptions {
  rememberDevice: boolean; // 30 dias
  rememberLogin: boolean;  // 7 dias
}