interface AutovizorLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export function AutovizorLogo({ size = 32, className = '', color = 'currentColor' }: AutovizorLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Car body (top view) - main rectangle */}
      <rect x="15" y="10" width="70" height="45" fill={color} />
      {/* Windshield cutout */}
      <rect x="27" y="20" width="46" height="22" fill="white" />
      {/* Left mirror */}
      <rect x="3" y="24" width="12" height="10" fill={color} />
      {/* Right mirror */}
      <rect x="85" y="24" width="12" height="10" fill={color} />
      {/* Left front pillar / leg */}
      <rect x="20" y="55" width="18" height="22" fill={color} />
      {/* Right front pillar / leg */}
      <rect x="62" y="55" width="18" height="22" fill={color} />
    </svg>
  );
}
