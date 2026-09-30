"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@/components/kiosk/icons";
import { useKiosk } from "@/components/kiosk/kiosk-provider";
import { ProductCard } from "@/components/kiosk/product-card";
import { ProductSheet } from "@/components/kiosk/product-sheet";
import { localize } from "@/lib/i18n/localized-text";
import { formatPrice } from "@/lib/money";
import { cartSummary } from "@/lib/order/cart";
import styles from "./menu.module.css";

export default function MenuPage() {
  const router = useRouter();
  const { menu, state, dispatch, t } = useKiosk();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  useEffect(() => {
    if (state.serviceType === null) router.replace("/mode");
  }, [state.serviceType, router]);

  if (state.serviceType === null) return null;

  const active =
    menu.categories.find((category) => category.id === selectedId) ??
    menu.categories[0];

  const openProduct =
    openProductId === null ? undefined : menu.products[openProductId];
  const summary = cartSummary(menu, state.items);

  if (!active) {
    return (
      <main className={styles.empty}>
        <p>{t.emptyMenu}</p>
      </main>
    );
  }

  return (
    <main className={styles.screen}>
      <div className={styles.body}>
        <nav className={styles.rail} aria-label="Menu categories">
          {menu.categories.map((category) => {
            const name = localize(category.name, state.locale);
            return (
              <button
                key={category.id}
                type="button"
                className={styles.category}
                aria-current={category.id === active.id ? "page" : undefined}
                onClick={() => setSelectedId(category.id)}
              >
                {category.imageUrl ? (
                  <Image className={styles.categoryImage} src={category.imageUrl} alt="" width={64} height={64} />
                ) : (
                  <span className={styles.categoryInitial} aria-hidden="true">
                    {name.charAt(0)}
                  </span>
                )}
                <span>{name}</span>
              </button>
            );
          })}
        </nav>

        <section className={styles.content}>
          <div className={styles.heading}>
            <h1 className={styles.title}>{localize(active.name, state.locale)}</h1>
            <span className={styles.count}>{t.itemCount(active.productIds.length)}</span>
          </div>
          <div key={active.id} className={styles.scroll}>
            <div className={styles.grid}>
              {active.productIds.map((id) => {
                const product = menu.products[id];
                if (!product) return null;
                return (
                  <ProductCard
                    key={id}
                    product={product}
                    locale={state.locale}
                    photoLabel={t.photo}
                    onSelect={() => setOpenProductId(id)}
                  />
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <footer className={styles.bar}>
        {summary.count === 0 ? (
          <div className={styles.barText}>
            <span className={styles.barTitle}>{t.emptyOrder}</span>
            <span className={styles.barHint}>{t.emptyOrderHint}</span>
          </div>
        ) : (
          <>
            <div className={styles.barText}>
              <span className={styles.barLabel}>
                {t.orderSummary(t.itemCount(summary.count))}
              </span>
              <span className={styles.barTotal}>
                {formatPrice(summary.totalMinor, state.locale)}
              </span>
            </div>
            <Link href="/cart" className={styles.review}>
              <span>{t.reviewOrder}</span>
              <span className={styles.reviewIcon}>
                <ArrowRightIcon size={40} />
              </span>
            </Link>
          </>
        )}
      </footer>

      {openProduct && (
        <ProductSheet
          key={openProduct.id}
          product={openProduct}
          onClose={() => setOpenProductId(null)}
          onSubmit={(item) => {
            dispatch({ type: "ADD_ITEM", item });
            setOpenProductId(null);
          }}
        />
      )}
    </main>
  );
}
