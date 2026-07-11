import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animate?: boolean;
}

export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
  animate = true,
  ...props
}: SkeletonProps) {
  const roundedMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  return (
    <div
      className={`bg-fw-neutral ${animate ? 'animate-pulse' : ''} ${roundedMap[rounded]} ${className}`}
      style={{
        width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : '100%',
        height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : '1rem'
      }}
      {...props}
    />
  );
}