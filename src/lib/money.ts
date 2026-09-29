import type { Locale } from "@/lib/i18n/locale";

const intlLocales: Record<Locale, string> = { en: "en-DK", da: "da-DK" };

export function formatPrice(amountMinor: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocales[locale], {
    style: "currency",
    currency: "DKK",
  }).format(amountMinor / 100);
}
