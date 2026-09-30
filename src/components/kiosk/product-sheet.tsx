"use client";

import Image from "next/image";
import { localize } from "@/lib/i18n/localized-text";
import type { MenuProduct } from "@/lib/menu/types";
import type { NewCartItem } from "@/lib/order/cart";
import { formatPrice } from "@/lib/money";
import {
  isGroupFull,
  MAX_QUANTITY,
  pickedIn,
  type Selection,
} from "@/lib/order/selection";
import { CloseIcon } from "./icons";
import { useKiosk } from "./kiosk-provider";
import { OptionGroup } from "./option-group";
import { QuantityStepper } from "./quantity-stepper";
import { useProductSelection } from "./use-product-selection";
import styles from "./product-sheet.module.css";

type ProductSheetProps = {
  product: MenuProduct;
  initialSelection?: Selection;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (item: NewCartItem) => void;
};

export function ProductSheet({
  product,
  initialSelection,
  submitLabel,
  onClose,
  onSubmit,
}: ProductSheetProps) {
  const { state, t } = useKiosk();
  const {
    selection,
    mealProduct,
    requiredGroups,
    addGroups,
    removeGroups,
    isComplete,
    totalMinor,
    toCartItem,
    toggleMeal,
    toggleOption,
    setOptionQuantity,
    setQuantity,
  } = useProductSelection(product, initialSelection);

  const locale = state.locale;
  const name = localize(product.name, locale);
  const hasOptions =
    mealProduct !== undefined ||
    requiredGroups.length + addGroups.length + removeGroups.length > 0;

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.scrim}
        aria-label={t.close}
        tabIndex={-1}
        onClick={onClose}
      />

      <div role="dialog" aria-modal="true" aria-label={name} className={styles.sheet}>
        <div className={styles.header}>
          <div className={styles.media}>
            {product.imageUrl ? (
              <Image className={styles.image} src={product.imageUrl} alt="" fill sizes="360px" />
            ) : (
              <>
                <span className={styles.badge}>{t.photo}</span>
                <span className={styles.initial} aria-hidden="true">
                  {name.charAt(0)}
                </span>
              </>
            )}
          </div>

          <div className={styles.intro}>
            <h2 className={styles.title}>{name}</h2>
            <span className={styles.basePrice}>
              {formatPrice(product.priceMinor, locale)}
            </span>
            {product.description && (
              <p className={styles.description}>
                {localize(product.description, locale)}
              </p>
            )}
          </div>

          <button
            type="button"
            className={styles.close}
            aria-label={t.close}
            onClick={onClose}
          >
            <CloseIcon size={44} />
          </button>
        </div>

        {hasOptions && (
          <div className={styles.body}>
            {mealProduct && (
              <button
                type="button"
                className={styles.meal}
                aria-pressed={selection.isMeal}
                onClick={toggleMeal}
              >
                <span className={styles.mealText}>
                  <span className={styles.mealTitle}>{t.makeItMeal}</span>
                  <span className={styles.mealHint}>
                    {t.mealHint(
                      formatPrice(mealProduct.priceMinor - product.priceMinor, locale),
                    )}
                  </span>
                </span>
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.knob} />
                </span>
              </button>
            )}
  
            {requiredGroups.map((group) => (
              <OptionGroup
                key={group.id}
                group={group}
                title={localize(group.name, locale)}
                locale={locale}
                picks={pickedIn(selection, group.id)}
                isFull={isGroupFull(selection, group)}
                showPrice
                decreaseLabel={t.decreaseQuantity}
                increaseLabel={t.increaseQuantity}
                onToggle={(productId) => toggleOption(group, productId)}
                onQuantityChange={(option, quantity) =>
                  setOptionQuantity(group, option, quantity)
                }
              />
            ))}
            {addGroups.map((group) => (
              <OptionGroup
                key={group.id}
                group={group}
                title={t.addExtras}
                locale={locale}
                picks={pickedIn(selection, group.id)}
                isFull={isGroupFull(selection, group)}
                showPrice
                decreaseLabel={t.decreaseQuantity}
                increaseLabel={t.increaseQuantity}
                onToggle={(productId) => toggleOption(group, productId)}
                onQuantityChange={(option, quantity) =>
                  setOptionQuantity(group, option, quantity)
                }
              />
            ))}
            {removeGroups.map((group) => (
              <OptionGroup
                key={group.id}
                group={group}
                title={t.leaveOff}
                locale={locale}
                picks={pickedIn(selection, group.id)}
                isFull={isGroupFull(selection, group)}
                showPrice={false}
                formatLabel={t.without}
                decreaseLabel={t.decreaseQuantity}
                increaseLabel={t.increaseQuantity}
                onToggle={(productId) => toggleOption(group, productId)}
                onQuantityChange={(option, quantity) =>
                  setOptionQuantity(group, option, quantity)
                }
              />
            ))}
          </div>
        )}

        <div className={styles.footer}>
          <QuantityStepper
            value={selection.quantity}
            max={MAX_QUANTITY}
            decreaseLabel={t.decreaseQuantity}
            increaseLabel={t.increaseQuantity}
            onChange={setQuantity}
          />
          <button
            type="button"
            className={styles.submit}
            disabled={!isComplete}
            onClick={() => onSubmit(toCartItem())}
          >
            <span>{submitLabel ?? t.addToOrder}</span>
            <span>{formatPrice(totalMinor, locale)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
