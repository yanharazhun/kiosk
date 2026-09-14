import { db } from './db';

async function main() {
  const drinks = await db.orm.public.Group.create({
    name: { uk: 'Напої', en: 'Drinks', da: 'Drikkevarer' },
    sortOrder: 1,
    isActive: true,
  });

  const coffee = await db.orm.public.Group.create({
    name: { uk: 'Кава', en: 'Coffee', da: 'Kaffe' },
    sortOrder: 1,
    isActive: true,
    parentGroupId: drinks.id,
  });

  const desserts = await db.orm.public.Group.create({
    name: { uk: 'Десерти', en: 'Desserts', da: 'Desserter' },
    sortOrder: 2,
    isActive: true,
  });

  await db.orm.public.Product.create({
    name: { uk: 'Лате', en: 'Latte', da: 'Latte' },
    groupId: coffee.id,
    sortOrder: 1,
    isActive: true,
  });

  await db.orm.public.Product.create({
    name: { uk: 'Капучино', en: 'Cappuccino', da: 'Cappuccino' },
    groupId: coffee.id,
    sortOrder: 2,
    isActive: true,
  });

  await db.orm.public.Product.create({
    name: { uk: 'Круасан', en: 'Croissant', da: 'Croissant' },
    groupId: desserts.id,
    sortOrder: 1,
    isActive: true,
  });

  console.log('Seeded.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
