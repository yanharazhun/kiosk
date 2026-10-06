import styles from "./confirm-dialog.module.css";

type ConfirmDialogProps = {
  title: string;
  lines: string[];
  detail?: string;
  cancelLabel: string;
  confirmLabel: string;
  tone: "default" | "danger";
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  title,
  lines,
  detail,
  cancelLabel,
  confirmLabel,
  tone,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.scrim}
        aria-label={cancelLabel}
        tabIndex={-1}
        onClick={onCancel}
      />
      <div role="alertdialog" aria-modal="true" aria-label={title} className={styles.dialog}>
        <h2 className={styles.title}>{title}</h2>
        <ul className={styles.lines}>
          {lines.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
        {detail && <p className={styles.detail}>{detail}</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={styles.confirm}
            data-tone={tone}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
