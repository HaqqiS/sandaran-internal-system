"use client";

import { IconChevronDown } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

export const COMMON_UNITS = [
  "Pcs",
  "Box",
  "Sak",
  "Kg",
  "Ton",
  "Meter",
  "M2",
  "M3",
  "Unit",
  "Set",
  "Roll",
  "Batang",
  "Lembar",
] as const;

/**
 * Normalisasi satuan: trim, single spacing, dan cocokkan casing ke COMMON_UNITS jika sesuai
 */
export function normalizeUnit(raw?: string): string {
  if (!raw) return "";
  const cleaned = raw.trim().replace(/\s+/g, " ");
  const match = COMMON_UNITS.find(
    (u) => u.toLowerCase() === cleaned.toLowerCase(),
  );
  return match ?? cleaned;
}

export interface UnitComboboxProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function UnitCombobox({
  id,
  value,
  onChange,
  onBlur,
  invalid = false,
  disabled = false,
  placeholder = "Pilih atau ketik satuan",
  className,
}: UnitComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Sertakan nilai kustom yang aktif (misal dari mode edit) ke dalam opsi
  const availableUnits = useMemo(() => {
    if (
      value &&
      !COMMON_UNITS.some((u) => u.toLowerCase() === value.trim().toLowerCase())
    ) {
      return [value.trim(), ...COMMON_UNITS];
    }
    return COMMON_UNITS;
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableUnits;
    return availableUnits.filter((u) => u.toLowerCase().includes(q));
  }, [query, availableUnits]);

  const typed = normalizeUnit(query);
  const showCustom =
    typed.length > 0 &&
    !availableUnits.some((u) => u.toLowerCase() === typed.toLowerCase());

  const handleSelect = (selectedVal: string) => {
    onChange(normalizeUnit(selectedVal));
    setQuery("");
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      modal={true}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
          onBlur?.();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          disabled={disabled}
          className={cn(
            "w-full h-9 rounded-full justify-between font-normal px-3.5 text-sm transition-all",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <IconChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0 rounded-2xl overflow-hidden shadow-lg border border-border"
        onOpenAutoFocus={(e) => e.preventDefault()}
        data-vaul-no-drag
      >
        <Command shouldFilter={false} className="rounded-2xl">
          <CommandInput
            placeholder="Cari atau ketik satuan..."
            value={query}
            onValueChange={setQuery}
          />
          <ScrollArea className="h-[220px]" data-vaul-no-drag>
            <CommandList className="max-h-none overflow-visible p-1">
              {filtered.length === 0 && !showCustom && (
                <CommandEmpty>Satuan tidak ditemukan.</CommandEmpty>
              )}
              <CommandGroup>
                {filtered.map((u) => (
                  <CommandItem
                    key={u}
                    value={u}
                    onSelect={() => handleSelect(u)}
                    data-checked={value === u}
                    className="py-1.5 px-2.5 min-h-8 rounded-lg cursor-pointer text-sm mb-1 last:mb-0"
                  >
                    {u}
                  </CommandItem>
                ))}
                {showCustom && (
                  <CommandItem
                    value={`__custom__${typed}`}
                    onSelect={() => handleSelect(typed)}
                    className="py-1.5 px-2.5 min-h-8 rounded-lg cursor-pointer text-primary font-medium text-sm mb-1 last:mb-0"
                  >
                    Gunakan &quot;{typed}&quot; sebagai satuan baru
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
