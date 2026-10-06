"use client";

import { useTransition } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { localize } from "@/lib/i18n/localized-text";
import { staffMessages } from "@/lib/i18n/staff-messages";
import { setProductAvailability } from "@/lib/staff/actions";
import type { StopList, StopListProduct } from "@/lib/staff/types";
import styles from "./stop-list-grid.module.css";

type StopListGridProps = {
  stopList: StopList;
  locale: Locale;
};

export function StopListGrid({ stopList, locale }: StopListGridProps) {
  const t = staffMessages[locale];
  const [isPending, startTransition] = useTransition();

  function toggle(product: StopListProduct) {
    startTransition(async () => {
      await setProductAvailability({
        productId: product.id,
        isAvailable: !product.isAvailable,
      });
    });
  }

  const sections = [
    { title: t.dishes, products: stopList.dishes },
    { title: t.ingredients, products: stopList.ingredients },
  ];

  return (
    <div className={styles.page}>
      {sections.map((section) => (
        <section key={section.title} className={styles.section}>
          <h2 className={styles.title}>{section.title}</h2>
          <div className={styles.grid}>
            {[...section.products]
              .sort((a, b) => localize(a.name, locale).localeCompare(localize(b.name, locale)))
              .map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={styles.tile}
                  aria-pressed={!product.isAvailable}
                  disabled={isPending}
                  onClick={() => toggle(product)}
                >
                  <span className={styles.name}>{localize(product.name, locale)}</span>
                  <span className={styles.state}>
                    {product.isAvailable ? t.available : t.soldOut}
                  </span>
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
