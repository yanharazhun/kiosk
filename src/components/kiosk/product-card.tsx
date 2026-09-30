import Image from "next/image";
import { localize } from "@/lib/i18n/localized-text";
import type { Locale } from "@/lib/i18n/locale";
import type { MenuProduct } from "@/lib/menu/types";
import { formatPrice } from "@/lib/money";
import { PlusIcon } from "./icons";
import styles from "./product-card.module.css";

type ProductCardProps = {
  product: MenuProduct;
  locale: Locale;
  photoLabel: string;
  onSelect: () => void;
};

export function ProductCard({ product, locale, photoLabel, onSelect }: ProductCardProps) {
  const name = localize(product.name, locale);

  return (
    <button type="button" className={styles.card} onClick={onSelect}>
      <span className={styles.media}>
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
      </span>
      <span className={styles.body}>
        <span className={styles.name}>{name}</span>
        {product.description && (
          <span className={styles.description}>
            {localize(product.description, locale)}
          </span>
        )}
        <span className={styles.footer}>
          <span className={styles.price}>
            {formatPrice(product.priceMinor, locale)}
          </span>
          <span className={styles.add} aria-hidden="true">
            <PlusIcon size={34} />
          </span>
        </span>
      </span>
    </button>
  );
}
