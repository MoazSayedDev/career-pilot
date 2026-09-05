// ==================== User ====================

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== Requests ====================

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface VerifyEmailDto {
  email: string;
  otp: string;
}

export interface ResendVerificationOtpDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyResetOtpDto {
  email: string;
  otp: string;
}

export interface ResetPasswordDto {
  email: string;
  resetToken: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// ==================== Responses ====================

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface ResendVerificationOtpResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: CurrentUser;
  };
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface LogoutAllResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface VerifyResetOtpResponse {
  success: boolean;
  message: string;
  data: {
    resetToken: string;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface CurrentUserResponse {
  success: boolean;
  message: string;
  data: CurrentUser;
}
