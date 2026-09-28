import type { ModifierGroupKind } from "@/generated/prisma/enums";
import type { LocalizedText } from "@/lib/i18n/localized-text";

export type MenuOption = {
  productId: string;
  name: LocalizedText;
  priceDeltaMinor: number;
  maxQuantity: number;
  isDefault: boolean;
};

export type MenuGroup = {
  id: string;
  name: LocalizedText;
  kind: ModifierGroupKind;
  minSelect: number;
  maxSelect: number;
  options: MenuOption[];
};

export type MenuProduct = {
  id: string;
  name: LocalizedText;
  description: LocalizedText | null;
  imageUrl: string | null;
  priceMinor: number;
  mealProductId: string | null;
  groups: MenuGroup[];
};

export type MenuCategory = {
  id: string;
  name: LocalizedText;
  imageUrl: string | null;
  productIds: string[];
};

export type Menu = {
  categories: MenuCategory[];
  products: Record<string, MenuProduct>;
};
