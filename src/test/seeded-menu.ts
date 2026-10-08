import { getMenu } from "@/lib/menu/get-menu";
import type { MenuGroup, MenuOption, MenuProduct } from "@/lib/menu/types";

function find<T>(items: T[], matches: (item: T) => boolean, label: string): T {
  const item = items.find(matches);
  if (!item) throw new Error(`Seed has no ${label}`);
  return item;
}

export function groupOf(product: MenuProduct, name: string): MenuGroup {
  return find(product.groups, (group) => group.name.en === name, `group "${name}"`);
}

export function optionOf(group: MenuGroup, name: string): MenuOption {
  return find(group.options, (option) => option.name.en === name, `option "${name}"`);
}

/** The seeded Classic Smash and its meal, looked up by name so tests don't hard-code ids. */
export async function seededClassic() {
  const menu = await getMenu();
  const products = Object.values(menu.products);
  const burger = find(products, (product) => product.name.en === "Classic Smash", "Classic Smash");
  const meal = find(products, (product) => product.id === burger.mealProductId, "Classic meal");
  return { burger, meal };
}
