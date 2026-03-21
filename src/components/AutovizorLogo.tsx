interface AutovizorLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export function AutovizorLogo({ size = 32, className = '', color = 'var(--color-primary-600)' }: AutovizorLogoProps) {
  const w = size * (217 / 145);
  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 217 145"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <g transform="translate(-310.332,-158.434)">
        <g transform="matrix(2.70474,0,0,2.70474,-140.735,-303.161)">
          <g>
            <g transform="matrix(1,0,0,1.07138,0.130173,-15.9968)">
              <rect x="175.004" y="195.22" width="10.602" height="28.899" fill={color} />
              <g transform="matrix(1,0,0,1,52.0498,0)">
                <rect x="175.004" y="195.22" width="10.602" height="28.899" fill={color} />
              </g>
              <g transform="matrix(7.51727e-17,-1.2125,2.15115,1.33585e-16,-244.81,418.013)">
                <rect x="175.004" y="195.22" width="10.602" height="28.899" fill={color} />
              </g>
            </g>
            <g transform="matrix(1.03368,0,0,1.03368,-12.2559,-1.082)">
              <g transform="matrix(1,0,0,1,10.2603,-29.0717)">
                <rect x="175.004" y="195.22" width="10.602" height="28.899" fill={color} />
              </g>
              <g transform="matrix(1,0,0,1,52.3102,-29.0717)">
                <rect x="175.004" y="195.22" width="10.602" height="28.899" fill={color} />
              </g>
              <g transform="matrix(3.23302e-17,-0.527993,1.80251,1.10372e-16,-166.413,264.147)">
                <rect x="175.004" y="195.22" width="10.602" height="28.899" fill={color} />
              </g>
            </g>
            <g transform="matrix(1,0,0,1,0,0.949522)">
              <rect x="166.769" y="187.609" width="15.386" height="7.367" fill={color} />
            </g>
            <g transform="matrix(1,0,0,1,64.6351,0.949522)">
              <rect x="166.769" y="187.609" width="15.386" height="7.367" fill={color} />
            </g>
            <rect x="177.979" y="198.505" width="53.205" height="12.132" fill={color} />
          </g>
        </g>
      </g>
    </svg>
  );
}
