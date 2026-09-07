import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from 'lucide-react';
import { Toaster as Sonner } from 'sonner';

/**
 * Toasts (spec 010 FR-008). Sonner, not the Radix `toast` + `toaster` pair the
 * reference codebase carries — that path is deprecated in shadcn.
 *
 * Two changes from what the registry generates, both from FR-009's review pass:
 *
 *  - it ships `useTheme()` from `next-themes` to follow a light/dark preference.
 *    this app has ONE theme and is not a Next.js app, so the theme is
 *    pinned to `light` and the dependency is not used.
 *  - `animate-spin` on the loading icon is kept: that is core Tailwind, not the
 *    tw-animate-css plugin this project does not install.
 */

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4" />,
        error: <OctagonX className="h-4 w-4" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
