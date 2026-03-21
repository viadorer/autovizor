interface AutovizorLogoProps {
  size?: number;
  className?: string;
}

export function AutovizorLogo({ size = 32, className = '' }: AutovizorLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <rect width="32" height="32" rx="8" className="fill-primary-600" />
      {/* Stylized A */}
      <path d="M16 7L8 24h3.5l1.5-3h6l1.5 3H24L16 7zm0 7l2.2 4.5h-4.4L16 14z" fill="white" />
      {/* Visor line */}
      <rect x="10" y="17.5" width="12" height="2" rx="1" fill="white" opacity="0.5" />
    </svg>
  );
}
