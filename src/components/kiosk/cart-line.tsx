import Image from "next/image";
import { localize } from "@/lib/i18n/localized-text";
import type { Locale } from "@/lib/i18n/locale";
import type { Messages } from "@/lib/i18n/messages";
import type { MenuProduct } from "@/lib/menu/types";
import { formatPrice } from "@/lib/money";
import type { CartItem, LineDetail } from "@/lib/order/cart";
import { MAX_QUANTITY } from "@/lib/order/selection";
import { QuantityStepper } from "./quantity-stepper";
import styles from "./cart-line.module.css";

type CartLineProps = {
  item: CartItem;
  product: MenuProduct;
  details: LineDetail[];
  totalMinor: number;
  locale: Locale;
  t: Messages;
  onEdit: () => void;
  onQuantityChange: (quantity: number) => void;
};

function formatDetail(detail: LineDetail, locale: Locale, t: Messages): string {
  const name = localize(detail.name, locale);
  const times = detail.quantity > 1 ? ` ×${detail.quantity}` : "";
  if (detail.kind === "remove") return t.without(name);
  if (detail.kind === "add") return `+ ${name}${times}`;
  return `${name}${times}`;
}

export function CartLine({
  item,
  product,
  details,
  totalMinor,
  locale,
  t,
  onEdit,
  onQuantityChange,
}: CartLineProps) {
  const name = localize(product.name, locale);
  const detailText = details.map((detail) => formatDetail(detail, locale, t)).join(" · ");

  return (
    <article className={styles.line}>
      <div className={styles.media}>
        {product.imageUrl ? (
          <Image className={styles.image} src={product.imageUrl} alt="" fill sizes="180px" />
        ) : (
          <span className={styles.initial} aria-hidden="true">
            {name.charAt(0)}
          </span>
        )}
      </div>

      <div className={styles.info}>
        <h2 className={styles.name}>{name}</h2>
        {detailText && <p className={styles.detail}>{detailText}</p>}
        <button type="button" className={styles.edit} onClick={onEdit}>
          {t.edit}
        </button>
      </div>

      <div className={styles.side}>
        <span className={styles.price}>{formatPrice(totalMinor, locale)}</span>
        <QuantityStepper
          size="compact"
          value={item.quantity}
          max={MAX_QUANTITY}
          decreaseLabel={t.decreaseQuantity}
          increaseLabel={t.increaseQuantity}
          removeLabel={t.removeItem(name)}
          onChange={onQuantityChange}
        />
      </div>
    </article>
  );
}
