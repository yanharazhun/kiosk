import type { ReactNode } from "react";
import { StaffHeader } from "@/components/staff/staff-header";
import { getStaffLocale } from "@/lib/staff/locale";
import styles from "./staff.module.css";

type StaffLayoutProps = {
  children: ReactNode;
};

export default async function StaffLayout({ children }: StaffLayoutProps) {
  const locale = await getStaffLocale();

  return (
    <div className={styles.app}>
      <StaffHeader locale={locale} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
