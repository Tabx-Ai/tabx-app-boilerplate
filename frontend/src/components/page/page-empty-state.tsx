import type { ReactNode } from 'react';

/** What a page shows when it has nothing to show (spec 010 FR-011). */
export default function PageEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mt-12 flex flex-col items-center justify-center gap-6 rounded-lg border border-dashed p-24">
      {icon && <div className="text-muted-foreground/80 [&>svg]:size-16">{icon}</div>}
      <div className="space-y-2 text-center">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
