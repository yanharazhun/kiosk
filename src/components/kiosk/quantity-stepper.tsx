import { MinusIcon, PlusIcon } from "./icons";
import styles from "./quantity-stepper.module.css";

type QuantityStepperProps = {
  value: number;
  max: number;
  min?: number;
  size?: "regular" | "compact";
  decreaseLabel: string;
  increaseLabel: string;
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
  onChange,
}: QuantityStepperProps) {
  return (
    <div className={styles.stepper} data-size={size}>
      <button
        type="button"
        className={styles.step}
        aria-label={decreaseLabel}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <MinusIcon size={ICON_SIZE[size]} />
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
