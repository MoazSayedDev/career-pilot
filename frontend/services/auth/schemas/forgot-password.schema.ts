import { z } from "zod";

/**
 * Schema factory: validation messages are resolved through the i18n
 * translator so they render in the active language.
 */
export const makeForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().trim().email(t("validation.emailInvalid")),
  });

export type ForgotPasswordFormData = z.infer<
  ReturnType<typeof makeForgotPasswordSchema>
>;
