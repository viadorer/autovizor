interface AutovizorLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export function AutovizorLogo({ size = 32, className = '' }: AutovizorLogoProps) {
  return (
    <img
      src="/favicon.svg"
      alt="Autovizor"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      style={{
        filter: 'brightness(0) saturate(100%) invert(56%) sepia(89%) saturate(1648%) hue-rotate(360deg) brightness(101%) contrast(96%)',
      }}
    />
  );
}
