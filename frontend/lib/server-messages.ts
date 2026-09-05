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
  "Email not verified. Please verify your email first.":
    "auth.signIn.emailNotVerified",
  "A record with these details already exists.": "errors.duplicateRecord",
  "Too many requests. Please try again later.": "errors.tooManyRequests",
  "Profile not found": "errors.notFound",
  "image must be a URL address": "validation.imageInvalid",
  "AI service is not configured. Please try again later.":
    "errors.aiUnavailable",
  "AI service is temporarily unavailable. Please try again.":
    "errors.aiUnavailable",
  "AI service returned an empty response. Please try again.":
    "errors.aiUnavailable",
};

/**
 * Messages the backend builds dynamically (e.g. "Account locked.
 * Try again in 14 minutes.") are matched by prefix.
 */
const SERVER_MESSAGE_PREFIXES: Array<[string, string]> = [
  ["Account locked", "auth.signIn.accountLocked"],
];

export function translateServerMessage(
  message: string | string[] | null | undefined,
  t: (key: string) => string,
): string {
  if (!message) return "";

  // class-validator emits arrays of messages; surface the first one.
  const text = Array.isArray(message) ? (message[0] ?? "") : message;

  const key = SERVER_MESSAGE_KEYS[text];
  if (key) return t(key);

  const prefix = SERVER_MESSAGE_PREFIXES.find(([p]) => text.startsWith(p));
  if (prefix) return t(prefix[1]);

  return text;
}
