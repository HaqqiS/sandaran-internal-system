"use client";

import { IconChevronDown, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { COUNTRIES, type Country } from "../../app/login/_data/countries";

interface CountryPickerProps {
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
  disabled?: boolean;
}

export function CountryPicker({
  selectedCountry,
  onSelectCountry,
  disabled = false,
}: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const query = search.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.dialCode.includes(query) ||
        c.code.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={`Pilih negara (saat ini ${selectedCountry.name} ${selectedCountry.dialCode})`}
          className="group absolute left-1.5 top-1/2 -translate-y-1/2 z-10 flex h-7 items-center gap-1.5 rounded-md border border-input/60 bg-muted/50 px-2 py-0.5 text-foreground shadow-2xs transition-all hover:bg-muted hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-sm leading-none drop-shadow-xs">
            {selectedCountry.flag}
          </span>
          <span className="font-mono text-xs font-semibold tracking-tight text-foreground/90">
            {selectedCountry.dialCode}
          </span>
          <IconChevronDown
            size={12}
            className="text-muted-foreground/70 transition-transform duration-200 group-hover:text-foreground group-data-[state=open]:rotate-180"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-68 p-2.5 shadow-2xl border-border/80 bg-popover rounded-xl"
      >
        <div className="space-y-2">
          {/* Search bar */}
          <div className="relative flex items-center">
            <IconSearch
              size={14}
              className="text-muted-foreground pointer-events-none absolute left-2.5"
            />
            <input
              type="text"
              placeholder="Cari nama atau kode negara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-muted/50 border-input h-8 w-full rounded-md border pl-8 pr-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
            />
          </div>

          {/* Countries list */}
          <div className="max-h-56 overflow-y-auto overscroll-contain space-y-0.5 pr-1 text-xs">
            {filteredCountries.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Negara tidak ditemukan
              </p>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = country.code === selectedCountry.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onSelectCountry(country);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground ml-2 shrink-0">
                      {country.dialCode}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
