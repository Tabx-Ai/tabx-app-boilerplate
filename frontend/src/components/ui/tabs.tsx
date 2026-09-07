import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * Two looks, one primitive (hotfix, after spec 063).
 *
 * **`line` is the default**: a full-bleed rule under the whole strip, and the selected tab marked
 * by a line beneath its label. It is what the product uses everywhere — the pill look survives as
 * a variant rather than being deleted, so a screen that wants a segmented control has one without
 * reintroducing what was removed.
 *
 * The variant travels by CONTEXT rather than as a prop on every part. A caller sets it once on
 * `<Tabs>`; `TabsList` and `TabsTrigger` read it. Passing it three times is three chances to leave
 * a trigger styled for the other variant, which looks like a bug in one tab.
 */
type TabsVariant = 'line' | 'pill'

const TabsVariantContext = React.createContext<TabsVariant>('line')

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & { variant?: TabsVariant }
>(({ variant = 'line', ...props }, ref) => (
  <TabsVariantContext.Provider value={variant}>
    <TabsPrimitive.Root ref={ref} {...props} />
  </TabsVariantContext.Provider>
))
Tabs.displayName = TabsPrimitive.Root.displayName

const LIST_CLASSES: Record<TabsVariant, string> = {
  /*
    FULL BLEED to the content area's edges. The page body is `px-8` (page-wrapper), so `-mx-8`
    takes the rule out to both edges and `px-8` puts the labels back where the content starts —
    the rule spans the page while the tabs stay aligned with everything under them.

    `h-auto` and `p-0` undo the pill's fixed height and inset; `bg-transparent` because the strip
    is a rule now, not a container.
  */
  /*
    ORDER MATTERS HERE: `p-0` must come BEFORE `px-8`, or tailwind-merge drops the `px-8` as
    superseded and the labels sit two rem left of the content they belong to. `p-0` is there to
    undo the pill's inset; `px-8` is what puts the labels back on the content's left edge after
    `-mx-8` took the rule out to the page's.
  */
  line: '-mx-8 h-auto w-full justify-start gap-6 rounded-none border-b border-border bg-transparent p-0 px-8',
  pill: 'h-10 items-center justify-center rounded-md bg-muted p-1',
}

const TRIGGER_CLASSES: Record<TabsVariant, string> = {
  /*
    The selected line is a `border-b-2` that is transparent until selected, NOT a border added on
    selection: an element that gains a border grows by two pixels and nudges its neighbours, so the
    whole strip twitches as you move between tabs.
  */
  line: 'rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 text-muted-foreground shadow-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none',
  pill: 'rounded-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
}


const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('inline-flex text-muted-foreground', LIST_CLASSES[React.useContext(TabsVariantContext)], className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex cursor-pointer items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      TRIGGER_CLASSES[React.useContext(TabsVariantContext)],
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
