import { z } from "zod";

/**
 * Schema factory: validation messages are resolved through the i18n
 * translator so they render in the active language.
 */
export const makeVerifyEmailSchema = (t: (key: string) => string) =>
  z.object({
    otp: z
      .string()
      .length(6, t("validation.otpLength"))
      .regex(/^\d+$/, t("validation.otpDigits")),
  });

export type VerifyEmailFormData = z.infer<
  ReturnType<typeof makeVerifyEmailSchema>
>;
