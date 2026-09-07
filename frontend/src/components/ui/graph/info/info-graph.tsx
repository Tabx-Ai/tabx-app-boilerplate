import type { InfoTile } from './adapter';

/**
 * Count tiles, no Recharts import — deliberately (FR-008): a "how many" cell sits on the same
 * grid as the charts and reads as part of one system, without paying for a chart runtime it
 * does not use.
 */
export function InfoGraph({ tiles, title }: { readonly tiles: InfoTile[]; readonly title: string }) {
  return (
    <div role="group" aria-label={title} className="flex flex-wrap gap-4">
      {tiles.map((tile) => (
        <div key={tile.key} className="min-w-24 flex-1 rounded-md border border-border bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground">{tile.label}</div>
          <div className="text-2xl font-semibold tabular-nums">{tile.value}</div>
        </div>
      ))}
    </div>
  );
}
