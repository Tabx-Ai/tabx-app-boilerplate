import { DownloadIcon } from 'lucide-react';

import ForData from '@/components/logics/for-data';
import OnlyIf from '@/components/logics/only-if';
import PageSearch from '@/components/page/page-search';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * The worked example of this design system (spec 010 FR-017): a page primitive
 * built from `ui/` primitives and the logic components. If this renders, the
 * pieces fit together.
 *
 * Unchanged from the reference in substance. Two adjustments: the hand-rolled
 * search input is now `PageSearch`, so there is one search field in the app
 * rather than two, and `For` / `OnlyIf` come from `@/components/logics/`.
 */

export interface MetricsHeaderMetric {
  label: string;
  value: string;
}

export interface MetricsHeaderFilterOption {
  label: string;
  value: string;
}

interface Props {
  title: string;
  description?: string;
  isLive?: boolean;
  onExport?: () => void;
  exportDisabled?: boolean;
  metrics: MetricsHeaderMetric[];
  filterLabel?: string;
  filterOptions?: MetricsHeaderFilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  onDateRangeClear?: () => void;
}

export default function MetricsHeader({
  title,
  description,
  isLive,
  onExport,
  exportDisabled,
  metrics,
  filterLabel = 'Status',
  filterOptions,
  filterValue,
  onFilterChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Search',
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onDateRangeClear,
}: Props) {
  const hasDateRange = onDateFromChange !== undefined && onDateToChange !== undefined;
  const showFilters =
    (filterOptions && filterOptions.length > 0) || onSearchChange !== undefined || hasDateRange;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
            <OnlyIf condition={Boolean(isLive)}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Live
              </span>
            </OnlyIf>
          </div>
          <OnlyIf condition={Boolean(description)}>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </OnlyIf>
        </div>

        <div className="flex items-center gap-2">
          <OnlyIf condition={hasDateRange}>
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1">
              <Input
                type="date"
                aria-label="From"
                value={dateFrom ?? ''}
                onChange={(event) => onDateFromChange?.(event.target.value)}
                className="h-8 w-[140px] border-0 px-1 shadow-none focus-visible:ring-0"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                aria-label="To"
                value={dateTo ?? ''}
                onChange={(event) => onDateToChange?.(event.target.value)}
                className="h-8 w-[140px] border-0 px-1 shadow-none focus-visible:ring-0"
              />
              <OnlyIf condition={Boolean((dateFrom || dateTo) && onDateRangeClear)}>
                <button
                  type="button"
                  onClick={onDateRangeClear}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </OnlyIf>
            </div>
          </OnlyIf>

          <OnlyIf condition={Boolean(onExport)}>
            <Button variant="outline" size="sm" onClick={onExport} disabled={exportDisabled}>
              <DownloadIcon className="size-4" />
              Export
            </Button>
          </OnlyIf>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ForData
          data={metrics}
          render={(metric) => (
            <div className="rounded-lg border border-border bg-background px-5 py-4">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {metric.value}
              </p>
            </div>
          )}
        />
      </div>

      <OnlyIf condition={showFilters}>
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 md:flex-row md:items-center md:justify-between">
          <OnlyIf condition={Boolean(filterOptions && filterOptions.length > 0)}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {filterLabel}
              </span>
              <ForData
                data={filterOptions ?? []}
                render={(option) => (
                  <button
                    type="button"
                    onClick={() => onFilterChange?.(option.value)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs transition-colors',
                      option.value === filterValue
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-foreground hover:bg-muted',
                    )}
                  >
                    {option.label}
                  </button>
                )}
              />
            </div>
          </OnlyIf>

          <OnlyIf condition={onSearchChange !== undefined}>
            <PageSearch
              value={search ?? ''}
              onChange={(value) => onSearchChange?.(value)}
              placeholder={searchPlaceholder}
              className="md:w-72"
            />
          </OnlyIf>
        </div>
      </OnlyIf>
    </div>
  );
}
