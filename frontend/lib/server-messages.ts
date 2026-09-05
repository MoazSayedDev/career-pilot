/**
 * Maps well-known backend auth messages to i18n keys so the UI never
 * shows English server text while the user is in Arabic. Unknown
 * messages are passed through unchanged (the server is the source of
 * truth for anything we have not mapped).
 */
const SERVER_MESSAGE_KEYS: Record<string, string> = {
  "Invalid email or password": "auth.signIn.invalidCredentials",
  "Email already registered": "auth.signUp.emailTaken",
  "Username already taken": "auth.signUp.usernameTaken",
  "Registration failed. Please try again.": "auth.signUp.unableToCreate",
  "Invalid email or OTP": "auth.otp.invalid",
  "Invalid or expired OTP": "auth.otp.invalid",
  "Invalid email or reset code": "auth.otp.invalid",
  "Invalid or expired reset code": "auth.otp.invalid",
  "Passwords do not match": "validation.passwordsMismatch",
  "Password reset failed. Please try again.": "auth.reset.failed",
};

export function translateServerMessage(
  message: string | null | undefined,
  t: (key: string) => string,
): string {
  if (!message) return "";

  const key = SERVER_MESSAGE_KEYS[message];

  return key ? t(key) : message;
}
