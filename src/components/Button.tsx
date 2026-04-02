import React, { useState } from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const [isHandlingClick, setIsHandlingClick] = useState(false);

  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none min-w-[44px] min-h-[44px]";
  
  const variants = {
    primary: "bg-primary text-on-primary hover:bg-primary-hover shadow-floating",
    secondary: "bg-surface-active text-text-main hover:bg-border",
    outline: "border border-border text-text-main hover:bg-surface-hover",
    ghost: "text-text-muted hover:text-text-main hover:bg-surface-hover",
    danger: "bg-error text-white hover:bg-red-600 shadow-floating"
  };

  const sizes = {
    sm: "h-9 px-4 text-[13px]",
    md: "h-11 px-5 text-[15px]",
    lg: "h-14 px-6 text-[17px]"
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      try {
        setIsHandlingClick(true);
        await onClick(e);
      } finally {
        setIsHandlingClick(false);
      }
    }
  };

  const loading = isLoading || isHandlingClick;
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
      ) : leftIcon ? (
        <span className="material-symbols-outlined text-[20px]">{leftIcon}</span>
      ) : null}
      
      {children}

      {!loading && rightIcon && (
        <span className="material-symbols-outlined text-[20px]">{rightIcon}</span>
      )}
    </motion.button>
  );
}
