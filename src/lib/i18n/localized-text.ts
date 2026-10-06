import { z } from "zod";
import type { Locale } from "./locale";

export const localizedTextSchema = z.object({
  en: z.string().min(1),
  da: z.string().min(1).optional(),
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;

export function parseLocalizedText(value: unknown, context: string): LocalizedText {
  const result = localizedTextSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid localized text in ${context}: ${result.error.message}`);
  }
  return result.data;
}

export function localize(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.en;
}
