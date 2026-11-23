import React from 'react';

interface LinktreeIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const LinktreeIcon: React.FC<LinktreeIconProps> = ({
  size = 20,
  color = 'currentColor',
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m13.736 5.853 4.005-4.117 2.325 2.38-4.2 4.007h5.908v3.305h-5.937l4.229 4.108-2.325 2.38-4.005-4.117v8.948h-3.472v-8.948l-4.005 4.117-2.325-2.38 4.229-4.108h-5.937v-3.305h5.908l-4.2-4.007 2.325-2.38 4.005 4.117v-4.59h3.472v4.59z" />
  </svg>
);

export default LinktreeIcon;
