import React, { useState } from 'react';

const PremiumButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  disabled = false,
  darkMode = true,
  className = '',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: darkMode
      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary: darkMode
      ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 shadow hover:shadow-md border border-slate-600'
      : 'bg-white hover:bg-slate-50 text-slate-900 shadow hover:shadow-md border border-slate-200',
    success: darkMode
      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
      : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl',
    danger: darkMode
      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
      : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl',
    ghost: darkMode
      ? 'bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
      : 'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400',
  };

  const sizes = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2.5 text-sm',
    large: 'px-6 py-3 text-base',
  };

  const disabledClass = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  const baseClass = `
    font-medium rounded-lg
    transition-all duration-250
    flex items-center justify-center gap-2
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${darkMode ? 'focus:ring-offset-slate-900' : 'focus:ring-offset-white'}
    ${variants[variant]}
    ${sizes[size]}
    ${disabledClass}
    ${isPressed && !disabled ? 'scale-95' : 'scale-100 hover:scale-102'}
    ${className}
  `;

  const handleMouseDown = () => {
    if (!disabled) setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={baseClass}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      disabled={disabled}
      style={{
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        minHeight: size === 'small' ? '32px' : size === 'medium' ? '44px' : '48px',
      }}
      {...props}
    >
      {Icon && <Icon size={size === 'small' ? 16 : size === 'medium' ? 18 : 20} />}
      {children}
    </button>
  );
};

export default PremiumButton;
