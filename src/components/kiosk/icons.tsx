type IconProps = { size?: number };

type LogoMarkProps = IconProps & { fill: string };

type StrokeIconProps = IconProps & {
  strokeWidth?: number;
  children: React.ReactNode;
};

export function LogoMark({ size = 48, fill }: LogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
      <path d="M6 26a22 18 0 0 1 44 0z" fill={fill} />
      <rect x="4" y="30" width="48" height="6" rx="3" fill="var(--color-ink)" />
      <path d="M7 40h42v2a8 8 0 0 1-8 8H15a8 8 0 0 1-8-8z" fill={fill} />
    </svg>
  );
}

function StrokeIcon({ size = 24, strokeWidth = 2, children }: StrokeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon({ size }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={2.2}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </StrokeIcon>
  );
}

export function PlusIcon({ size }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={2.4}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </StrokeIcon>
  );
}

export function MinusIcon({ size }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={2.4}>
      <path d="M5 12h14" />
    </StrokeIcon>
  );
}

export function CloseIcon({ size }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={2.2}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </StrokeIcon>
  );
}

export function CheckIcon({ size }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={3}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </StrokeIcon>
  );
}

export function TrashIcon({ size }: IconProps) {
  return (
    <StrokeIcon size={size}>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M9 7V4h6v3" />
    </StrokeIcon>
  );
}

export function ArrowLeftIcon({ size }: IconProps) {
  return (
    <StrokeIcon size={size}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </StrokeIcon>
  );
}

export function ArrowDownIcon({ size }: IconProps) {
  return (
    <StrokeIcon size={size}>
      <path d="M12 4v16" />
      <path d="M6 14l6 6 6-6" />
    </StrokeIcon>
  );
}

export function CardIcon({ size }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={1.5}>
      <rect x="2.5" y="6" width="15" height="11" rx="2" />
      <path d="M2.5 10h15" />
      <path d="M20 8.5a5 5 0 0 1 0 7" />
      <path d="M22 6.5a8 8 0 0 1 0 11" />
    </StrokeIcon>
  );
}

export function CashIcon({ size }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={1.5}>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01" />
      <path d="M18 12h.01" />
    </StrokeIcon>
  );
}

export function TrayIcon({ size }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={1.4}>
      <path d="M3 17.5h18" />
      <path d="M4.5 17.5a7.5 7.5 0 0 1 15 0" />
      <path d="M12 10V8" />
      <path d="M10.5 8h3" />
    </StrokeIcon>
  );
}

export function BagIcon({ size }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={1.4}>
      <path d="M5 8h14l-1 13H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </StrokeIcon>
  );
}
