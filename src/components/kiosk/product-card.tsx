import Image from "next/image";
import { localize } from "@/lib/i18n/localized-text";
import type { Locale } from "@/lib/i18n/locale";
import type { MenuProduct } from "@/lib/menu/types";
import { formatPrice } from "@/lib/money";
import { PlusIcon } from "./icons";
import styles from "./product-card.module.css";

export function ProductCard({
  product,
  locale,
  photoLabel,
}: {
  product: MenuProduct;
  locale: Locale;
  photoLabel: string;
}) {
  const name = localize(product.name, locale);

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {product.imageUrl ? (
          <Image className={styles.image} src={product.imageUrl} alt="" fill sizes="400px" />
        ) : (
          <>
            <span className={styles.badge}>{photoLabel}</span>
            <span className={styles.initial} aria-hidden="true">
              {name.charAt(0)}
            </span>
          </>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        {product.description && (
          <p className={styles.description}>
            {localize(product.description, locale)}
          </p>
        )}
        <div className={styles.footer}>
          <span className={styles.price}>
            {formatPrice(product.priceMinor, locale)}
          </span>
          <span className={styles.add} aria-hidden="true">
            <PlusIcon size={34} />
          </span>
        </div>
      </div>
    </article>
  );
}
