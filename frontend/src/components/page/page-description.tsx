/** Secondary text under a title (spec 010 FR-011). */
export default function PageDescription({ description }: { description: string }) {
  return <p className="text-sm text-muted-foreground">{description}</p>;
}
