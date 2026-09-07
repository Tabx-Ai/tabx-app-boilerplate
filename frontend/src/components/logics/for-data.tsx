import { Fragment, type ReactNode } from 'react';

/**
 * Render one node per item (spec 010 FR-014).
 *
 * GENERIC, where the reference typed this as `data: any[]` and
 * `render: Function` (FR-015). Those signatures erase the element type at every
 * call site — `render` would take an implicit `any`, and a typo in a field name
 * would survive to runtime, which is the opposite of what a shared helper should
 * do. Here `T` is inferred from `data`, so `render` is checked against the real
 * element type. Constitution Article IX §1 also allows no bare `any`.
 *
 * Each item is wrapped in a keyed `<Fragment>`. The reference wrapped it in an
 * inline component instead (`let Component = () => render(item, index)`), which
 * hands React a brand-new component type on every render and remounts the whole
 * row — losing focus, scroll position and any state inside it.
 *
 * Keys are the index, as in the reference: correct for the static lists this
 * renders, wrong for a reorderable one. A list whose items move needs a stable
 * id and should map directly rather than reach for this.
 */
export default function ForData<T>({
  data,
  render,
}: {
  data: readonly T[];
  render: (item: T, index: number) => ReactNode;
}) {
  return (
    <>
      {data.map((item, index) => (
        <Fragment key={index}>{render(item, index)}</Fragment>
      ))}
    </>
  );
}
