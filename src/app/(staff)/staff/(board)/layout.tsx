import type { ReactNode } from "react";
import { StaffHeader } from "@/components/staff/staff-header";
import { requireStaff } from "@/lib/auth/session";
import { getStaffLocale } from "@/lib/staff/locale";
import styles from "./board.module.css";

type BoardLayoutProps = {
  children: ReactNode;
};

export default async function BoardLayout({ children }: BoardLayoutProps) {
  const [user, locale] = await Promise.all([requireStaff(), getStaffLocale()]);

  return (
    <>
      <StaffHeader locale={locale} userName={user.displayName} />
      <main className={styles.main}>{children}</main>
    </>
  );
}
