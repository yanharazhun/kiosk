"use server";

import { verify } from "@node-rs/argon2";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, deleteCurrentSession, isStaffRole } from "./session";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MS = 5 * 60 * 1000;

export type LoginState =
  | { error: "invalid" | "wrong_credentials" }
  | { error: "locked"; minutes: number }
  | null;

const credentialsSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
});

async function recordFailedAttempt(userId: string): Promise<void> {
  const { failedAttempts } = await db.user.update({
    where: { id: userId },
    data: { failedAttempts: { increment: 1 } },
    select: { failedAttempts: true },
  });
  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    await db.user.update({
      where: { id: userId },
      data: { failedAttempts: 0, lockedUntil: new Date(Date.now() + LOCK_MS) },
    });
  }
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = credentialsSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "invalid" };
  const { username, password } = parsed.data;

  const user = await db.user.findFirst({
    where: { username, deletedAt: null },
    select: { id: true, role: true, secretHash: true, lockedUntil: true },
  });
  if (!user) return { error: "wrong_credentials" };

  const now = Date.now();
  if (user.lockedUntil && user.lockedUntil.getTime() > now) {
    return { error: "locked", minutes: Math.ceil((user.lockedUntil.getTime() - now) / 60_000) };
  }

  const passwordOk = await verify(user.secretHash, password);
  if (!passwordOk || !isStaffRole(user.role)) {
    await recordFailedAttempt(user.id);
    return { error: "wrong_credentials" };
  }

  await db.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null },
  });
  await createSession(user.id);
  redirect("/staff");
}

export async function logout(): Promise<void> {
  await deleteCurrentSession();
  redirect("/staff/login");
}
