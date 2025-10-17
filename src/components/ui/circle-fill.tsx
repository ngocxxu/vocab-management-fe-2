import React from 'react';

type CircleFillProps = {
  className?: string;
  size?: number;
  color?: string;
};

export const CircleFill: React.FC<CircleFillProps> = ({
  className = '',
  size = 16,
  color = 'currentColor',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill={color}
    >
      <path d="M 27.9999 51.9063 C 41.0546 51.9063 51.9063 41.0781 51.9063 28 C 51.9063 14.9453 41.0312 4.0937 27.9765 4.0937 C 14.8983 4.0937 4.0937 14.9453 4.0937 28 C 4.0937 41.0781 14.9218 51.9063 27.9999 51.9063 Z" />
    </svg>
  );
};
