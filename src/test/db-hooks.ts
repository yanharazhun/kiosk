import { afterAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { isTestDatabase } from "./database-url";

if (!isTestDatabase(process.env.DATABASE_URL ?? "")) {
  throw new Error("Integration tests must run against a *_test database");
}

beforeEach(async () => {
  await db.$executeRaw`TRUNCATE "Order", "OrderCounter", "Session" CASCADE`;
  await db.user.updateMany({ data: { failedAttempts: 0, lockedUntil: null } });
  await db.product.updateMany({ data: { isAvailable: true } });
});

afterAll(async () => {
  await db.$disconnect();
});
