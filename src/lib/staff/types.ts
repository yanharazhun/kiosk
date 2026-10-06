import type {
  ModifierGroupKind,
  OrderStatus,
  PaymentMethod,
  ServiceType,
} from "@/generated/prisma/enums";
import type { LocalizedText } from "@/lib/i18n/localized-text";

export type StaffOrderModifier = {
  id: string;
  kind: ModifierGroupKind;
  name: LocalizedText;
  quantity: number;
};

export type StaffOrderItem = {
  id: string;
  name: LocalizedText;
  quantity: number;
  modifiers: StaffOrderModifier[];
};

export type StaffOrder = {
  id: string;
  number: number;
  status: OrderStatus;
  serviceType: ServiceType;
  paymentMethod: PaymentMethod;
  totalMinor: number;
  createdAt: string;
  paidAt: string | null;
  items: StaffOrderItem[];
};

export type StaffOrders = {
  orders: StaffOrder[];
  serverNow: string;
};

export type StopListProduct = {
  id: string;
  name: LocalizedText;
  isAvailable: boolean;
};

export type StopList = {
  dishes: StopListProduct[];
  ingredients: StopListProduct[];
};
