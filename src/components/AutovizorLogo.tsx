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
      viewBox="0 0 18 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      shapeRendering="crispEdges"
    >
      {/* Roof */}
      <rect x="5" y="0" width="8" height="2" fill={color} />
      {/* Body + windshield frame */}
      <rect x="3" y="2" width="12" height="6" fill={color} />
      {/* Windshield cutout (white) */}
      <rect x="6" y="2" width="6" height="4" fill="white" />
      {/* Left mirror */}
      <rect x="1" y="4" width="2" height="3" fill={color} />
      {/* Right mirror */}
      <rect x="15" y="4" width="2" height="3" fill={color} />
      {/* Left leg */}
      <rect x="3" y="8" width="4" height="6" fill={color} />
      {/* Right leg */}
      <rect x="11" y="8" width="4" height="6" fill={color} />
    </svg>
  );
}
