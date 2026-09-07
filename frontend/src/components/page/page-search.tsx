import { SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * A search field with its icon (spec 010 FR-011).
 *
 * Built on `ui/input` rather than a bare `<input>` as the reference has it:
 * every field in the app should share one set of focus, disabled and invalid
 * styles, and the reference's hand-rolled `border bg-white` was a second answer
 * to that question (FR-012).
 *
 * **It has a name of its own** (spec 023 FR-009). It did not: it was an `Input`
 * with a placeholder and nothing else, which is not a name — a placeholder is
 * announced inconsistently between screen readers and disappears on the first
 * keystroke, exactly when someone tabbing back needs to know what the field is.
 * `label` defaults to the placeholder so the existing caller keeps working, and
 * `type="search"` makes it a `searchbox` rather than one more textbox on a page
 * that may hold several.
 */
export default function PageSearch({
  onChange,
  className,
  placeholder = 'Search',
  value = '',
  label,
}: {
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  value?: string;
  /**
   * What this field searches — "Search designations", not "Search".
   *
   * Visually hidden rather than rendered: the icon and the placeholder already say
   * what this is to anyone who can see it, and a visible label above a filter box
   * costs a line on every list screen. Hidden is not the same as absent.
   */
  readonly label?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label={label ?? placeholder}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        value={value}
        className="pl-9"
      />
    </div>
  );
}
