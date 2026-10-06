import { StopListGrid } from "@/components/staff/stop-list-grid";
import { getStopList } from "@/lib/staff/get-stop-list";
import { getStaffLocale } from "@/lib/staff/locale";

export default async function StaffStopListPage() {
  const [stopList, locale] = await Promise.all([getStopList(), getStaffLocale()]);

  return <StopListGrid stopList={stopList} locale={locale} />;
}
