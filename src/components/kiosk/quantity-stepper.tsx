import { MinusIcon, PlusIcon, TrashIcon } from "./icons";
import styles from "./quantity-stepper.module.css";

type QuantityStepperProps = {
  value: number;
  max: number;
  min?: number;
  size?: "regular" | "compact";
  decreaseLabel: string;
  increaseLabel: string;
  /** When set, "−" at 1 becomes a trash button that goes to 0. */
  removeLabel?: string;
  onChange: (value: number) => void;
};

const ICON_SIZE = { regular: 36, compact: 24 };

export function QuantityStepper({
  value,
  max,
  min = 1,
  size = "regular",
  decreaseLabel,
  increaseLabel,
  removeLabel,
  onChange,
}: QuantityStepperProps) {
  const isRemove = removeLabel !== undefined && value === 1;

  return (
    <div className={styles.stepper} data-size={size}>
      <button
        type="button"
        className={styles.step}
        aria-label={isRemove ? removeLabel : decreaseLabel}
        disabled={!isRemove && value <= min}
        onClick={() => onChange(value - 1)}
      >
        {isRemove ? (
          <TrashIcon size={ICON_SIZE[size]} />
        ) : (
          <MinusIcon size={ICON_SIZE[size]} />
        )}
      </button>
      <span className={styles.value} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={styles.step}
        aria-label={increaseLabel}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <PlusIcon size={ICON_SIZE[size]} />
      </button>
    </div>
  );
}
