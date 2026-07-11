import { ReactNode, memo, forwardRef, isValidElement, ComponentType } from 'react';

interface ButtonProps {
  children: ReactNode;
  icon?: ReactNode | ComponentType<any>;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
}

const ButtonComponent = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  icon,
  variant = 'primary',
  fullWidth = false,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  size = 'md',
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-colors';

  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  const variantStyles = {
    primary: 'bg-fw-ctaPrimary text-fw-linkPrimary hover:bg-fw-ctaPrimaryHover focus:ring-2 focus:ring-fw-active focus:ring-offset-2 border border-fw-ctaPrimary transition-all',
    secondary: 'bg-transparent text-fw-linkSecondary hover:bg-fw-neutral border border-fw-secondary transition-all',
    outline: 'bg-fw-base border border-fw-secondary text-fw-body hover:bg-fw-wash transition-all',
    danger: 'bg-fw-error text-fw-linkPrimary hover:bg-[rgb(159_0_40)] focus:ring-2 focus:ring-fw-error border border-fw-error transition-all',
  };

  const iconSizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  const renderIcon = () => {
    if (!icon) return null;

    if (isValidElement(icon)) {
      return <span className="mr-2">{icon}</span>;
    }

    if (typeof icon === 'function') {
      const IconComponent = icon as ComponentType<any>;
      return <IconComponent className={`${iconSizeClass} mr-2`} />;
    }

    return null;
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {renderIcon()}
      {children}
    </button>
  );
});

ButtonComponent.displayName = 'Button';

export const Button = memo(ButtonComponent);