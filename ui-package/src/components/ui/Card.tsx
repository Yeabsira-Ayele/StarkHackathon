import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'subtle' | 'interactive' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  curve?: 'default' | 'xl' | '2xl' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', curve = 'default', className = '', children, ...props }, ref) => {
    const curves = {
      default: 'rounded-xl',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      lg: 'rounded-lg',
    };

    const base = `${curves[curve]} bg-surface transition-all duration-200`;

    const variants = {
      default: 'border border-border shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_8px_-2px_rgba(0,0,0,0.02)]',
      outlined: 'border border-border-strong',
      subtle: 'bg-surface-subtle border border-border-subtle',
      interactive: 'border border-border shadow-xs hover:border-border-strong hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
      accent: 'border-t-2 border-t-accent border-x border-b border-border shadow-xs',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-7 sm:p-8',
    };

    return (
      <div
        ref={ref}
        className={`${base} ${variants[variant]} ${paddings[padding]} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`flex flex-col gap-1 pb-4 border-b border-border-subtle mb-4 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-base font-semibold tracking-tight text-text text-balance ${className}`.trim()}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', children, ...props }, ref) => (
    <p ref={ref} className={`text-xs text-text-muted leading-relaxed ${className}`.trim()} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`space-y-4 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center justify-between pt-4 mt-4 border-t border-border-subtle ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

export default Card;
