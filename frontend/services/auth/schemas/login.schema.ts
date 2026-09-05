import { z } from "zod";

/**
 * Schema factory: validation messages are resolved through the i18n
 * translator so they render in the active language.
 */
export const makeLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("validation.emailRequired")),

    password: z.string().min(1, t("validation.passwordRequired")),
  });

export type LoginFormData = z.infer<ReturnType<typeof makeLoginSchema>>;
