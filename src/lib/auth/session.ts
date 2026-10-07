import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Role } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "./session-cookie";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const STAFF_ROLES: readonly Role[] = ["KITCHEN", "ADMIN"];

export type CurrentUser = {
  id: string;
  displayName: string;
  role: Role;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.session.create({ data: { id: hashToken(token), userId, expiresAt } });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    select: {
      expiresAt: true,
      user: { select: { id: true, displayName: true, role: true, deletedAt: true } },
    },
  });
  if (!session || session.expiresAt <= new Date() || session.user.deletedAt) return null;

  const { id, displayName, role } = session.user;
  return { id, displayName, role };
});

export async function requireStaff(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !STAFF_ROLES.includes(user.role)) redirect("/staff/login");
  return user;
}

export function isStaffRole(role: Role): boolean {
  return STAFF_ROLES.includes(role);
}

export async function deleteCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  cookieStore.delete(SESSION_COOKIE);
}
