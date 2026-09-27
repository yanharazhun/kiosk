import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  ModifierGroupKind,
  Prisma,
  PrismaClient,
  Role,
} from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type LocalizedText = { en: string; da: string };

function text(en: string, da: string = en): LocalizedText {
  return { en, da };
}

function kr(amount: number): number {
  return Math.round(amount * 100);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

function lookup<T>(map: Map<string, T>, key: string): T {
  const value = map.get(key);
  if (value === undefined) throw new Error(`Unknown seed key "${key}"`);
  return value;
}

const categories = [
  { key: "new", name: text("New", "Nyheder") },
  { key: "burgers", name: text("Burgers", "Burgere") },
  { key: "chicken", name: text("Chicken", "Kylling") },
  { key: "meals", name: text("Meals", "Menuer") },
  { key: "sides", name: text("Sides", "Tilbehør") },
  { key: "drinks", name: text("Drinks", "Drikkevarer") },
  { key: "sweets", name: text("Sweets", "Desserter") },
] as const;

type CategoryKey = (typeof categories)[number]["key"];

type ProductSeed = {
  key: string;
  name: LocalizedText;
  description?: LocalizedText;
  priceMinor: number;
  categories: CategoryKey[];
};

const mealDescription = text("With a side and a drink", "Med tilbehør og drik");

const products: ProductSeed[] = [
  {
    key: "classic",
    name: text("Classic Smash"),
    description: text(
      "Smashed beef patty, cheddar, pickles, onion, house sauce",
      "Smashed oksebøf, cheddar, syltede agurker, løg, husets sauce",
    ),
    priceMinor: kr(79),
    categories: ["burgers"],
  },
  {
    key: "double",
    name: text("Double Smash"),
    description: text(
      "Two patties, double cheese, pickles, onion, house sauce",
      "To bøffer, dobbelt ost, syltede agurker, løg, husets sauce",
    ),
    priceMinor: kr(99),
    categories: ["burgers"],
  },
  {
    key: "bbq",
    name: text("Smoky BBQ"),
    description: text(
      "Beef patty, cheddar, crispy onions, bacon, BBQ sauce",
      "Oksebøf, cheddar, sprøde løg, bacon, BBQ-sauce",
    ),
    priceMinor: kr(95),
    categories: ["burgers", "new"],
  },
  {
    key: "mushroom",
    name: text("Mushroom Swiss"),
    description: text(
      "Beef patty, Swiss cheese, garlic mushrooms, truffle mayo",
      "Oksebøf, schweizerost, hvidløgssvampe, trøffelmayo",
    ),
    priceMinor: kr(92),
    categories: ["burgers"],
  },
  {
    key: "garden",
    name: text("Garden Crunch"),
    description: text(
      "Crispy chickpea patty, lettuce, tomato, herb mayo",
      "Sprød kikærtebøf, salat, tomat, urtemayo",
    ),
    priceMinor: kr(85),
    categories: ["burgers"],
  },
  {
    key: "crispy",
    name: text("Crispy Chicken", "Sprød kylling"),
    description: text(
      "Buttermilk fried chicken, slaw, pickles, garlic mayo",
      "Kærnemælksstegt kylling, coleslaw, syltede agurker, hvidløgsmayo",
    ),
    priceMinor: kr(85),
    categories: ["chicken"],
  },
  {
    key: "hotHoney",
    name: text("Hot Honey Chicken", "Hot honey-kylling"),
    description: text(
      "Fried chicken, chilli honey glaze, pickles, ranch",
      "Stegt kylling, chili-honningglace, syltede agurker, ranch",
    ),
    priceMinor: kr(92),
    categories: ["chicken", "new"],
  },
  {
    key: "classicMeal",
    name: text("Classic Smash Meal", "Classic Smash-menu"),
    description: mealDescription,
    priceMinor: kr(119),
    categories: ["meals"],
  },
  {
    key: "doubleMeal",
    name: text("Double Smash Meal", "Double Smash-menu"),
    description: mealDescription,
    priceMinor: kr(139),
    categories: ["meals"],
  },
  {
    key: "crispyMeal",
    name: text("Crispy Chicken Meal", "Sprød kylling-menu"),
    description: mealDescription,
    priceMinor: kr(125),
    categories: ["meals"],
  },
  {
    key: "fries",
    name: text("Fries", "Pommes frites"),
    description: text("Skin-on, sea salt", "Med skræl og havsalt"),
    priceMinor: kr(35),
    categories: ["sides"],
  },
  {
    key: "sweetPotato",
    name: text("Sweet Potato Fries", "Søde kartoffelfritter"),
    description: text("With smoked paprika salt", "Med røget paprikasalt"),
    priceMinor: kr(42),
    categories: ["sides"],
  },
  {
    key: "onionRings",
    name: text("Onion Rings", "Løgringe"),
    description: text("Beer-battered, with ranch", "I ølbatter med ranch"),
    priceMinor: kr(42),
    categories: ["sides"],
  },
  {
    key: "cola",
    name: text("Cola"),
    description: text("Ice-cold", "Iskold"),
    priceMinor: kr(29),
    categories: ["drinks"],
  },
  {
    key: "lemonade",
    name: text("House Lemonade", "Hjemmelavet lemonade"),
    description: text("Fresh-squeezed", "Friskpresset"),
    priceMinor: kr(32),
    categories: ["drinks"],
  },
  {
    key: "icedTea",
    name: text("Peach Iced Tea", "Iste med fersken"),
    description: text("Brewed in-house", "Brygget i huset"),
    priceMinor: kr(30),
    categories: ["drinks"],
  },
  {
    key: "shake",
    name: text("Vanilla Shake", "Vaniljeshake"),
    description: text("Made with soft serve", "Lavet på softice"),
    priceMinor: kr(45),
    categories: ["drinks"],
  },
  {
    key: "cookie",
    name: text("Choc Chip Cookie", "Chokoladecookie"),
    description: text("Baked every morning", "Bagt hver morgen"),
    priceMinor: kr(22),
    categories: ["sweets"],
  },
  {
    key: "softServe",
    name: text("Soft Serve", "Softice"),
    description: text("Vanilla cone", "Vanilje i vaffel"),
    priceMinor: kr(25),
    categories: ["sweets"],
  },
  {
    key: "sundae",
    name: text("Brownie Sundae", "Brownie-sundae"),
    description: text(
      "Warm brownie, soft serve, fudge",
      "Varm brownie, softice, fudge",
    ),
    priceMinor: kr(49),
    categories: ["sweets"],
  },
  { key: "cheese", name: text("Cheese", "Ost"), priceMinor: 0, categories: [] },
  { key: "bacon", name: text("Bacon"), priceMinor: 0, categories: [] },
  { key: "jalapenos", name: text("Jalapeños"), priceMinor: 0, categories: [] },
  { key: "avocado", name: text("Avocado"), priceMinor: 0, categories: [] },
  { key: "onion", name: text("Onion", "Løg"), priceMinor: 0, categories: [] },
  {
    key: "pickles",
    name: text("Pickles", "Syltede agurker"),
    priceMinor: 0,
    categories: [],
  },
  { key: "lettuce", name: text("Lettuce", "Salat"), priceMinor: 0, categories: [] },
  {
    key: "houseSauce",
    name: text("House sauce", "Husets sauce"),
    priceMinor: 0,
    categories: [],
  },
];

const mealUpgrades = [
  { product: "classic", meal: "classicMeal" },
  { product: "double", meal: "doubleMeal" },
  { product: "crispy", meal: "crispyMeal" },
];

type GroupSeed = {
  key: string;
  name: LocalizedText;
  kind: ModifierGroupKind;
  minSelect: number;
  maxSelect: number;
  options: {
    product: string;
    priceDeltaMinor?: number;
    maxQuantity?: number;
    isDefault?: boolean;
  }[];
};

const groups: GroupSeed[] = [
  {
    key: "extras",
    name: text("Extras", "Ekstra"),
    kind: ModifierGroupKind.ADD,
    minSelect: 0,
    maxSelect: 4,
    options: [
      { product: "cheese", priceDeltaMinor: kr(10), maxQuantity: 2 },
      { product: "bacon", priceDeltaMinor: kr(15) },
      { product: "jalapenos", priceDeltaMinor: kr(8) },
      { product: "avocado", priceDeltaMinor: kr(12) },
    ],
  },
  {
    key: "remove",
    name: text("Remove", "Uden"),
    kind: ModifierGroupKind.REMOVE,
    minSelect: 0,
    maxSelect: 4,
    options: [
      { product: "onion" },
      { product: "pickles" },
      { product: "lettuce" },
      { product: "houseSauce" },
    ],
  },
  {
    key: "drink",
    name: text("Choose a drink", "Vælg drik"),
    kind: ModifierGroupKind.ADD,
    minSelect: 1,
    maxSelect: 1,
    options: [
      { product: "cola", isDefault: true },
      { product: "lemonade" },
      { product: "icedTea" },
      { product: "shake", priceDeltaMinor: kr(15) },
    ],
  },
  {
    key: "side",
    name: text("Choose a side", "Vælg tilbehør"),
    kind: ModifierGroupKind.ADD,
    minSelect: 1,
    maxSelect: 1,
    options: [
      { product: "fries", isDefault: true },
      { product: "sweetPotato", priceDeltaMinor: kr(7) },
      { product: "onionRings", priceDeltaMinor: kr(7) },
    ],
  },
];

const mains = ["classic", "double", "bbq", "mushroom", "garden", "crispy", "hotHoney"];
const meals = ["classicMeal", "doubleMeal", "crispyMeal"];

const productGroups = [
  ...mains.map((product) => ({ product, groups: ["extras", "remove"] })),
  ...meals.map((product) => ({
    product,
    groups: ["extras", "remove", "drink", "side"],
  })),
];

async function seedUsers() {
  const kioskPin = requireEnv("SEED_KIOSK_PIN");
  if (!/^\d{4,8}$/.test(kioskPin)) {
    throw new Error("SEED_KIOSK_PIN must be 4 to 8 digits");
  }

  const users = [
    {
      username: "admin",
      displayName: "Admin",
      role: Role.ADMIN,
      secret: requireEnv("SEED_ADMIN_PASSWORD"),
    },
    {
      username: "kitchen",
      displayName: "Kitchen",
      role: Role.KITCHEN,
      secret: requireEnv("SEED_KITCHEN_PASSWORD"),
    },
    {
      username: "demo",
      displayName: "Demo kiosk",
      role: Role.KIOSK,
      secret: kioskPin,
    },
  ];

  for (const { secret, ...user } of users) {
    await db.user.create({
      data: { ...user, secretHash: await hash(secret) },
    });
  }

  console.log(`Seeded ${users.length} users`);
}

async function seedMenu(tx: Prisma.TransactionClient) {
  const categoryIds = new Map<string, string>();
  for (const [index, category] of categories.entries()) {
    const created = await tx.category.create({
      data: { name: category.name, sortOrder: index },
    });
    categoryIds.set(category.key, created.id);
  }

  const positionInCategory = new Map<string, number>();
  const productIds = new Map<string, string>();
  for (const product of products) {
    const links = product.categories.map((key) => {
      const sortOrder = positionInCategory.get(key) ?? 0;
      positionInCategory.set(key, sortOrder + 1);
      return { categoryId: lookup(categoryIds, key), sortOrder };
    });

    const created = await tx.product.create({
      data: {
        name: product.name,
        description: product.description,
        priceMinor: product.priceMinor,
        categories: { create: links },
      },
    });
    productIds.set(product.key, created.id);
  }

  for (const { product, meal } of mealUpgrades) {
    await tx.product.update({
      where: { id: lookup(productIds, product) },
      data: { mealProductId: lookup(productIds, meal) },
    });
  }

  const groupIds = new Map<string, string>();
  for (const group of groups) {
    const created = await tx.modifierGroup.create({
      data: {
        name: group.name,
        kind: group.kind,
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        modifiers: {
          create: group.options.map((option, index) => ({
            productId: lookup(productIds, option.product),
            priceDeltaMinor: option.priceDeltaMinor ?? 0,
            maxQuantity: option.maxQuantity ?? 1,
            isDefault: option.isDefault ?? false,
            sortOrder: index,
          })),
        },
      },
    });
    groupIds.set(group.key, created.id);
  }

  await tx.productModifierGroup.createMany({
    data: productGroups.flatMap(({ product, groups: groupKeys }) =>
      groupKeys.map((group, index) => ({
        productId: lookup(productIds, product),
        groupId: lookup(groupIds, group),
        sortOrder: index,
      })),
    ),
  });

  console.log(
    `Seeded ${categories.length} categories, ${products.length} products, ${groups.length} modifier groups`,
  );
}

async function main() {
  await seedUsers();
  await db.$transaction(seedMenu, { timeout: 30_000 });
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
