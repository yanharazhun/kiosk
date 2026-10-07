import { redirect } from "next/navigation";
import { LoginForm } from "@/components/staff/login-form";
import { getCurrentUser, isStaffRole } from "@/lib/auth/session";
import { getStaffLocale } from "@/lib/staff/locale";

export default async function StaffLoginPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getStaffLocale()]);
  if (user && isStaffRole(user.role)) redirect("/staff");

  return <LoginForm locale={locale} />;
}
