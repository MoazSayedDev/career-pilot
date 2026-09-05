import { z } from "zod";
import { LinkType } from "../types/contact-info";

const optionalString = (schema: z.ZodString) =>
  schema.optional().or(z.literal(""));

/**
 * Schema factory: validation messages are resolved through the i18n
 * translator so they render in the active language.
 */
export const makeContactInfoSchema = (t: (key: string) => string) => {
  const profileLinkSchema = z.object({
    type: z.nativeEnum(LinkType, {
      message: t("validation.linkTypeInvalid"),
    }),
    url: z
      .string()
      .trim()
      .url(t("validation.urlInvalid"))
      .max(500, t("validation.urlMax")),
  });

  return z.object({
    phone: optionalString(
      z.string().max(20, t("validation.phoneMax")),
    ),

    email: optionalString(
      z
        .string()
        .email(t("validation.emailInvalid"))
        .max(100, t("validation.emailMax")),
    ),

    country: optionalString(
      z.string().max(100, t("validation.countryMax")),
    ),

    city: optionalString(
      z.string().max(100, t("validation.cityMax")),
    ),

    links: z.array(profileLinkSchema).optional(),
  });
};

export type ContactInfoFormData = z.infer<
  ReturnType<typeof makeContactInfoSchema>
>;
