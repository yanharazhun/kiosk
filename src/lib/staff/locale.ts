import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/locale";

export const STAFF_LOCALE_COOKIE = "staff-locale";

export async function getStaffLocale(): Promise<Locale> {
  const value = (await cookies()).get(STAFF_LOCALE_COOKIE)?.value;
  return locales.find((locale) => locale === value) ?? defaultLocale;
}
