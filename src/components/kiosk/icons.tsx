type IconProps = { size?: number };

export function LogoMark({ size = 48, fill }: IconProps & { fill: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
      <path d="M6 26a22 18 0 0 1 44 0z" fill={fill} />
      <rect x="4" y="30" width="48" height="6" rx="3" fill="var(--color-ink)" />
      <path d="M7 40h42v2a8 8 0 0 1-8 8H15a8 8 0 0 1-8-8z" fill={fill} />
    </svg>
  );
}

function StrokeIcon({
  size = 24,
  strokeWidth = 2,
  children,
}: IconProps & { strokeWidth?: number; children: React.ReactNode }) {
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
