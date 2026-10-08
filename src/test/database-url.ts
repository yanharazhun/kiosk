export function isTestDatabase(databaseUrl: string): boolean {
  return new URL(databaseUrl).pathname.endsWith("_test");
}
