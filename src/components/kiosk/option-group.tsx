import { localize } from "@/lib/i18n/localized-text";
import type { Locale } from "@/lib/i18n/locale";
import type { MenuGroup, MenuOption } from "@/lib/menu/types";
import { formatPrice } from "@/lib/money";
import { optionMax } from "@/lib/order/selection";
import { CheckIcon } from "./icons";
import { QuantityStepper } from "./quantity-stepper";
import styles from "./option-group.module.css";

type OptionGroupProps = {
  group: MenuGroup;
  title: string;
  locale: Locale;
  picks: Record<string, number>;
  isFull: boolean;
  showPrice: boolean;
  decreaseLabel: string;
  increaseLabel: string;
  formatLabel?: (name: string) => string;
  onToggle: (productId: string) => void;
  onQuantityChange: (option: MenuOption, quantity: number) => void;
};

export function OptionGroup({
  group,
  title,
  locale,
  picks,
  isFull,
  showPrice,
  decreaseLabel,
  increaseLabel,
  formatLabel = (name) => name,
  onToggle,
  onQuantityChange,
}: OptionGroupProps) {
  const isSingle = group.maxSelect === 1;
  const isRequired = group.minSelect > 0;

  return (
    <section className={styles.group}>
      <h3 className={styles.title}>
        {title}
        {isRequired && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </h3>
      <div className={styles.options}>
        {group.options.map((option) => {
          const quantity = picks[option.productId] ?? 0;
          const on = quantity > 0;
          const max = optionMax(group, option);
          const hasStepper = on && max > 1;
          const isDisabled = !on && isFull && !isSingle;

          return (
            <div
              key={option.productId}
              className={styles.option}
              data-selected={on}
              data-disabled={isDisabled}
              data-stepper={hasStepper}
            >
              <button
                type="button"
                className={styles.toggle}
                aria-pressed={on}
                disabled={isDisabled}
                onClick={() => onToggle(option.productId)}
              >
                <span
                  className={styles.indicator}
                  data-shape={isSingle ? "radio" : "checkbox"}
                  aria-hidden="true"
                >
                  {on && !isSingle && <CheckIcon size={22} />}
                </span>
                <span className={styles.text}>
                  <span className={styles.label}>
                    {formatLabel(localize(option.name, locale))}
                  </span>
                  {showPrice && option.priceDeltaMinor > 0 && (
                    <span className={styles.price}>
                      +{formatPrice(option.priceDeltaMinor, locale)}
                    </span>
                  )}
                </span>
              </button>

              {hasStepper && (
                <QuantityStepper
                  size="compact"
                  value={quantity}
                  min={0}
                  max={isFull ? quantity : max}
                  decreaseLabel={decreaseLabel}
                  increaseLabel={increaseLabel}
                  onChange={(value) => onQuantityChange(option, value)}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
