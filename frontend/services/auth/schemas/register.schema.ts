import { z } from "zod";

/**
 * Schema factory: validation messages are resolved through the i18n
 * translator so they render in the active language.
 */
export const makeRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      username: z
        .string()
        .trim()
        .min(3, t("validation.usernameMin"))
        .max(30, t("validation.usernameMax")),

      email: z.string().trim().email(t("validation.emailInvalid")),

      password: z
        .string()
        .min(8, t("validation.passwordMin"))
        .regex(/[A-Z]/, t("validation.passwordUppercase"))
        .regex(/[a-z]/, t("validation.passwordLowercase"))
        .regex(/[0-9]/, t("validation.passwordNumber"))
        .regex(
          /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
          t("validation.passwordSpecial"),
        )
        .max(128, t("validation.passwordMax")),

      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsMismatch"),
      path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<ReturnType<typeof makeRegisterSchema>>;
