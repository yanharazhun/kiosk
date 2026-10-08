"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CartLine } from "@/components/kiosk/cart-line";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/kiosk/icons";
import { useKiosk } from "@/components/kiosk/kiosk-provider";
import { ProductSheet } from "@/components/kiosk/product-sheet";
import { formatPrice } from "@/lib/money";
import {
  cartSummary,
  lineDetails,
  lineProduct,
  lineTotalMinor,
  toSelection,
} from "@/lib/order/cart";
import styles from "./cart.module.css";

export default function CartPage() {
  const router = useRouter();
  const { menu, state, dispatch, t } = useKiosk();
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (state.serviceType === null) router.replace("/");
  }, [state.serviceType, router]);

  if (state.serviceType === null) return null;

  const locale = state.locale;
  const summary = cartSummary(menu, state.items);
  const lines = state.items.flatMap((item) => {
    const product = lineProduct(menu, item);
    return product ? [{ item, product }] : [];
  });
  const editing = state.items.find((item) => item.id === editingId);
  const editingProduct = editing ? menu.products[editing.productId] : undefined;

  return (
    <main className={styles.screen}>
      <div className={styles.scroll}>
        <Link href="/menu" className={styles.back}>
          <ArrowLeftIcon size={36} />
          {t.keepOrdering}
        </Link>
        <h1 className={styles.title}>{t.yourOrder}</h1>

        {lines.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyText}>{t.cartEmpty}</span>
            <Link href="/menu" className={styles.browse}>
              {t.browseMenu}
            </Link>
          </div>
        ) : (
          <div className={styles.lines}>
            {lines.map(({ item, product }) => (
              <CartLine
                key={item.id}
                item={item}
                product={product}
                details={lineDetails(menu, item)}
                totalMinor={lineTotalMinor(menu, item)}
                locale={locale}
                t={t}
                onEdit={() => setEditingId(item.id)}
                onQuantityChange={(quantity) =>
                  dispatch({ type: "SET_ITEM_QUANTITY", id: item.id, quantity })
                }
              />
            ))}
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <footer className={styles.footer}>
          <div className={styles.totalRow}>
            <div className={styles.totalText}>
              <span className={styles.totalLabel}>
                {t.totalCount(t.itemCount(summary.count))}
              </span>
              <span className={styles.taxNote}>{t.pricesIncludeTax}</span>
            </div>
            <span className={styles.total}>{formatPrice(summary.totalMinor, locale)}</span>
          </div>
          <Link href="/pay" className={styles.pay}>
            {t.continueToPayment}
            <ArrowRightIcon size={44} />
          </Link>
        </footer>
      )}

      {editing && editingProduct && (
        <ProductSheet
          key={editing.id}
          product={editingProduct}
          initialSelection={toSelection(editing)}
          submitLabel={t.updateItem}
          onClose={() => setEditingId(null)}
          onSubmit={(item) => {
            dispatch({ type: "UPDATE_ITEM", id: editing.id, item });
            setEditingId(null);
          }}
        />
      )}
    </main>
  );
}
