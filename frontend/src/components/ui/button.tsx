import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Semantic tokens only — `bg-primary`, never `bg-blue-600` and never a `dark:`
 * variant. There is one palette and no dark mode, so a semantic token IS the final
 * answer — nothing swaps underneath it.
 */
const buttonVariants = cva(
  'inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary  rounded-sm text-primary-foreground hover:opacity-90',
        destructive: 'bg-destructive rounded-sm text-destructive-foreground hover:opacity-90',
        outline: 'border border-input rounded-sm bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary rounded-sm text-secondary-foreground hover:opacity-80',
        ghost: 'hover:bg-accent rounded-sm hover:text-accent-foreground',
        link: 'text-primary rounded-sm  underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };
