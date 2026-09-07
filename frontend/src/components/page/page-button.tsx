import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** A page's primary action (spec 010 FR-011). */
export default function PageButton({
  title,
  icon,
  onClick,
  className,
}: {
  title: string;
  icon?: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button onClick={onClick} className={cn(className)}>
      {icon}
      {title}
    </Button>
  );
}
