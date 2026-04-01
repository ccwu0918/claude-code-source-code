import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  selected = false,
  hoverable = false,
}) => {
  return (
    <div
      className={`
        rounded-xl border p-4 transition-all
        ${hoverable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}
        ${selected 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`font-semibold text-lg ${className}`}>{children}</div>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`mt-2 ${className}`}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>
);
