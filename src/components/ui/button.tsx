import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1419] disabled:pointer-events-none disabled:opacity-40 active:scale-95 relative overflow-hidden group',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/60 hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700',
        destructive:
          'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/40 hover:shadow-2xl hover:shadow-rose-500/60 hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700',
        outline:
          'border-2 border-white/10 bg-white/5 backdrop-blur-sm text-slate-200 hover:bg-white/10 hover:border-indigo-400/50 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20',
        secondary:
          'bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 shadow-md hover:from-slate-600 hover:to-slate-500 hover:shadow-xl',
        ghost: 'hover:bg-white/10 hover:text-white text-slate-300 backdrop-blur-sm',
        link: 'text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300',
        success: 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/60 hover:scale-105',
        warning: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/60 hover:scale-105',
      },
      size: {
        default: 'h-11 px-6 py-2.5',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-14 rounded-2xl px-10 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
