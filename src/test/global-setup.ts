import { execSync } from "node:child_process";
import { Client } from "pg";
import type { TestProject } from "vitest/node";
import { isTestDatabase } from "./database-url";

/** Recreates the test database from migrations and the seed before the integration run. */
export default async function setup(project: TestProject) {
  const url = project.config.env.DATABASE_URL ?? "";
  if (!isTestDatabase(url)) throw new Error(`Refusing to reset ${url}: not a *_test database`);

  const name = new URL(url).pathname.slice(1);
  const maintenanceUrl = new URL(url);
  maintenanceUrl.pathname = "/postgres";

  const admin = new Client({ connectionString: maintenanceUrl.toString() });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${name}"`);
  } finally {
    await admin.end();
  }

  const env = { ...process.env, DATABASE_URL: url };
  execSync("npx prisma migrate deploy", { env, stdio: "pipe" });
  execSync("npx prisma db seed", { env, stdio: "pipe" });
}
