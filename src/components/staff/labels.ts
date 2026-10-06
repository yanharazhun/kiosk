import type { StaffMessages } from "@/lib/i18n/staff-messages";
import type { StaffTarget } from "@/lib/order/transitions";

export function actionLabels(t: StaffMessages): Record<StaffTarget, string> {
  return {
    PAID: t.markPaid,
    PREPARING: t.start,
    READY: t.markReady,
    COMPLETED: t.handOver,
    CANCELLED: t.cancelOrder,
  };
}

export function confirmTitles(t: StaffMessages): Partial<Record<StaffTarget, (number: number) => string>> {
  return {
    PAID: t.confirmPaid,
    CANCELLED: t.confirmCancel,
    COMPLETED: t.confirmHandOver,
  };
}
