"use client";

import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconPlus,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export interface FilterItem {
  id: string;
  field: string;
  label: string;
  operator?: "eq" | "contains" | "gte" | "lte";
  value: string | number;
  displayValue: string;
}

export interface FilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FilterField {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  options?: FilterOption[];
}

export interface FilterBarProps {
  fields: FilterField[];
  activeFilters: FilterItem[];
  onAddFilter: (filter: FilterItem) => void;
  onRemoveFilter: (filterId: string) => void;
  onResetFilters: () => void;
  className?: string;
  triggerLabel?: string;
}

export function FilterBar({
  fields,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onResetFilters,
  className,
  triggerLabel = "Filter",
}: FilterBarProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedFieldId, setSelectedFieldId] = React.useState<string | null>(
    null,
  );

  const selectedField = React.useMemo(
    () => fields.find((f) => f.id === selectedFieldId),
    [fields, selectedFieldId],
  );

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedFieldId(null);
    }
  };

  const handleSelectOption = (field: FilterField, option: FilterOption) => {
    onAddFilter({
      id: field.id,
      field: field.id,
      label: field.label,
      operator: "eq",
      value: option.value,
      displayValue: option.label,
    });
    setOpen(false);
    setSelectedFieldId(null);
  };

  const handleOpenFieldDirectly = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    setOpen(true);
  };

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5 md:gap-2", className)}
    >
      {/* ── Filter Trigger Popover ── */}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs font-medium cursor-pointer"
          >
            <IconFilter className="size-3.5 text-muted-foreground" />
            <span>{triggerLabel}</span>
            <IconPlus className="size-3 text-muted-foreground ml-0.5" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-56 p-1.5 text-xs shadow-md border-border bg-popover"
        >
          {selectedField ? (
            /* ── Step 2: Choose Option for Selected Field ── */
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setSelectedFieldId(null)}
                  className="flex size-5 items-center justify-center rounded hover:bg-muted text-foreground transition-colors cursor-pointer"
                  title="Kembali ke daftar atribut"
                >
                  <IconChevronLeft className="size-3.5" />
                </button>
                <span className="font-semibold text-foreground truncate">
                  {selectedField.label}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 pt-1 max-h-56 overflow-y-auto">
                {selectedField.options?.map((option) => {
                  const isActive = activeFilters.some(
                    (f) =>
                      f.field === selectedField.id && f.value === option.value,
                  );
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectOption(selectedField, option)}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {Icon && <Icon className="size-3.5 shrink-0" />}
                        <span className="truncate">{option.label}</span>
                      </div>
                      {isActive && (
                        <IconCheck className="size-3.5 shrink-0 text-primary ml-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── Step 1: Choose Attribute Field ── */
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1.5 font-medium text-muted-foreground border-b border-border">
                Pilih Atribut Filter
              </div>
              <div className="flex flex-col gap-0.5 pt-1">
                {fields.map((field) => {
                  const activeFilter = activeFilters.find(
                    (f) => f.field === field.id,
                  );
                  const Icon = field.icon;

                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => setSelectedFieldId(field.id)}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer",
                        activeFilter
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {Icon && (
                          <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate">{field.label}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {activeFilter && (
                          <span className="max-w-[70px] truncate text-[11px] font-semibold text-primary">
                            {activeFilter.displayValue}
                          </span>
                        )}
                        <IconChevronRight className="size-3.5 shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* ── Active Filter Pills (Notion / Linear Style) ── */}
      {activeFilters.map((filter) => (
        <div
          key={filter.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-foreground transition-all hover:bg-primary/15"
        >
          <button
            type="button"
            onClick={() => handleOpenFieldDirectly(filter.field)}
            className="flex items-center gap-1 text-left cursor-pointer hover:underline"
            title="Klik untuk mengubah nilai filter"
          >
            <span className="text-muted-foreground">{filter.label}:</span>
            <span className="font-semibold text-primary">
              {filter.displayValue}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onRemoveFilter(filter.id)}
            className="ml-0.5 -mr-1 flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/20 hover:text-foreground transition-colors cursor-pointer"
            aria-label={`Hapus filter ${filter.label}`}
          >
            <IconX className="size-3" />
          </button>
        </div>
      ))}

      {/* ── Reset All Filters Button ── */}
      {activeFilters.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1 cursor-pointer"
        >
          <IconRefresh className="size-3" />
          <span>Reset</span>
        </Button>
      )}
    </div>
  );
}

/**
 * Pure helper functions for managing filter items (used by hook and standalone)
 */
export function addFilterItem(
  prev: FilterItem[],
  filter: FilterItem,
): FilterItem[] {
  const remaining = prev.filter((f) => f.field !== filter.field);
  return [...remaining, filter];
}

export function removeFilterItem(
  prev: FilterItem[],
  filterId: string,
): FilterItem[] {
  return prev.filter((f) => f.id !== filterId && f.field !== filterId);
}

/**
 * Standard hook for managing dynamic filter state
 */
export function useDynamicFilters(initialFilters: FilterItem[] = []) {
  const [activeFilters, setActiveFilters] =
    React.useState<FilterItem[]>(initialFilters);

  const addFilter = React.useCallback((filter: FilterItem) => {
    setActiveFilters((prev) => addFilterItem(prev, filter));
  }, []);

  const removeFilter = React.useCallback((filterId: string) => {
    setActiveFilters((prev) => removeFilterItem(prev, filterId));
  }, []);

  const resetFilters = React.useCallback(() => {
    setActiveFilters([]);
  }, []);

  const getFilterValue = React.useCallback(
    (field: string) => activeFilters.find((f) => f.field === field)?.value,
    [activeFilters],
  );

  return {
    activeFilters,
    addFilter,
    removeFilter,
    resetFilters,
    setActiveFilters,
    getFilterValue,
  };
}
