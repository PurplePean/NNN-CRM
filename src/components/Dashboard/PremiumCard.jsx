import React, { useState } from 'react';

const PremiumCard = ({
  children,
  onClick,
  hoverable = false,
  darkMode = true,
  className = '',
  padding = 'default',
  elevation = 'soft',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const paddings = {
    none: '',
    small: 'p-3',
    default: 'p-4',
    large: 'p-6',
  };

  const elevations = {
    none: '',
    subtle: 'shadow-sm',
    soft: 'shadow-md',
    medium: 'shadow-lg',
    elevated: 'shadow-xl',
  };

  const baseClass = `
    rounded-lg
    border
    transition-all duration-250
    ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
    ${paddings[padding]}
    ${elevations[elevation]}
    ${hoverable || onClick ? 'cursor-pointer' : ''}
    ${isHovered && (hoverable || onClick) ? 'shadow-xl scale-102' : ''}
    ${className}
  `;

  const handleMouseEnter = () => {
    if (hoverable || onClick) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  return (
    <div
      className={baseClass}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered && (hoverable || onClick) ? 'translateY(-2px)' : 'translateY(0)',
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default PremiumCard;
