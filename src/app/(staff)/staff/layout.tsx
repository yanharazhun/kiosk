import type { ReactNode } from "react";
import styles from "./staff.module.css";

type StaffLayoutProps = {
  children: ReactNode;
};

export default function StaffLayout({ children }: StaffLayoutProps) {
  return <div className={styles.app}>{children}</div>;
}
