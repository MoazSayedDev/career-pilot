import { z } from "zod";

const optionalString = (schema: z.ZodString) =>
  schema.optional().or(z.literal(""));

/**
 * Schema factory: validation messages are resolved through the i18n
 * translator so they render in the active language.
 */
export const makeProfileSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z
      .string()
      .min(2, t("validation.firstNameMin"))
      .max(50),

    lastName: z
      .string()
      .min(2, t("validation.lastNameMin"))
      .max(50),

    headline: optionalString(
      z.string().max(100, t("validation.headlineMax")),
    ),

    bio: optionalString(
      z.string().max(1000, t("validation.bioMax")),
    ),

    image: optionalString(z.string().url(t("validation.imageInvalid"))),
  });

export type ProfileFormData = z.infer<ReturnType<typeof makeProfileSchema>>;
