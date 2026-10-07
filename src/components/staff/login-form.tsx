"use client";

import { useActionState } from "react";
import { LogoMark } from "@/components/kiosk/icons";
import { login, type LoginState } from "@/lib/auth/actions";
import type { Locale } from "@/lib/i18n/locale";
import { staffMessages, type StaffMessages } from "@/lib/i18n/staff-messages";
import styles from "./login-form.module.css";

type LoginFormProps = {
  locale: Locale;
};

function errorMessage(state: LoginState, t: StaffMessages): string | null {
  if (!state) return null;
  switch (state.error) {
    case "invalid":
      return t.invalidLogin;
    case "wrong_credentials":
      return t.wrongCredentials;
    case "locked":
      return t.locked(state.minutes);
  }
}

export function LoginForm({ locale }: LoginFormProps) {
  const t = staffMessages[locale];
  const [state, action, isPending] = useActionState(login, null);
  const error = errorMessage(state, t);

  return (
    <div className={styles.page}>
      <form action={action} className={styles.card}>
        <div className={styles.brand}>
          <LogoMark size={40} fill="var(--color-accent)" />
          <span className={styles.brandName}>Ember &amp; Bun</span>
        </div>
        <h1 className={styles.title}>{t.loginTitle}</h1>

        <label className={styles.field}>
          <span className={styles.label}>{t.username}</span>
          <input
            className={styles.input}
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            required
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{t.password}</span>
          <input
            className={styles.input}
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button type="submit" className={styles.submit} disabled={isPending}>
          {t.logIn}
        </button>
      </form>
    </div>
  );
}
