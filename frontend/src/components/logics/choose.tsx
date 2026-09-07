import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

/**
 * A multi-branch conditional (spec 010 FR-014):
 *
 *   <Choose>
 *     <When condition={a}>…</When>
 *     <When condition={b}>…</When>
 *     <Otherwise>…</Otherwise>
 *   </Choose>
 *
 * The first `When` whose condition is true wins; if none does, `Otherwise`
 * renders. Same semantics as the reference, with one fix: it called
 * `children.forEach`, which throws when `Choose` has a single child, because
 * React only passes an array when there is more than one. `Children.toArray`
 * normalises that.
 */

interface WhenProps {
  condition?: boolean;
  children: ReactNode;
}

export function When({ children }: WhenProps) {
  return <>{children}</>;
}

export function Otherwise({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Choose({ children }: { children: ReactNode }) {
  let chosen: ReactNode = null;
  let fallback: ReactNode = null;

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;

    if (child.type === Otherwise) {
      fallback = child;
      continue;
    }

    // First match wins, and later branches are not evaluated.
    if (!chosen && (child as ReactElement<WhenProps>).props.condition) {
      chosen = child;
    }
  }

  return <>{chosen ?? fallback}</>;
}
