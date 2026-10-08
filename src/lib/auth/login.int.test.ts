import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { login } from "./actions";

function credentials(username: string, password: string): FormData {
  const form = new FormData();
  form.set("username", username);
  form.set("password", password);
  return form;
}

const kitchenPassword = process.env.SEED_KITCHEN_PASSWORD ?? "";

describe("login", () => {
  it("gives the same answer for an unknown user and a wrong password", async () => {
    expect(await login(null, credentials("nobody", "whatever"))).toEqual({ error: "wrong_credentials" });
    expect(await login(null, credentials("kitchen", "wrong"))).toEqual({ error: "wrong_credentials" });
  });

  it("locks the account after 5 wrong passwords, even for the right one", async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      await login(null, credentials("kitchen", "wrong"));
    }

    expect(await login(null, credentials("kitchen", kitchenPassword))).toEqual({
      error: "locked",
      minutes: 5,
    });
  });

  it("counts every failed attempt, even when they arrive at once", async () => {
    await Promise.all(Array.from({ length: 4 }, () => login(null, credentials("kitchen", "wrong"))));

    const user = await db.user.findUniqueOrThrow({ where: { username: "kitchen" } });
    expect(user.failedAttempts).toBe(4);
  });

  it("does not let the kiosk account into the staff screen", async () => {
    const pin = process.env.SEED_KIOSK_PIN ?? "";

    expect(await login(null, credentials("demo", pin))).toEqual({ error: "wrong_credentials" });
  });
});
