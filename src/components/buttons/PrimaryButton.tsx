
import React from 'react';
import { cn } from '@/lib/utils';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  className,
  children,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  return (
    <button
      className={cn(
        'relative rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-donezo-blue text-white hover:bg-donezo-blue/90',
        variant === 'outline' && 'border border-donezo-blue bg-transparent text-donezo-blue hover:bg-donezo-blue/10',
        variant === 'secondary' && 'bg-donezo-teal text-white hover:bg-donezo-teal/90',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
