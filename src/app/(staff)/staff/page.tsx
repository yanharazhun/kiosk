import { OrderBoard } from "@/components/staff/order-board";
import { getStaffOrders } from "@/lib/staff/get-staff-orders";
import { getStaffLocale } from "@/lib/staff/locale";

export default async function StaffOrdersPage() {
  const [data, locale] = await Promise.all([getStaffOrders(), getStaffLocale()]);

  return <OrderBoard data={data} locale={locale} />;
}
