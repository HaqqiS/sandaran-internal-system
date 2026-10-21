"use client";

import {
  IconAdjustmentsHorizontal,
  IconArrowsSort,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconChevronUp,
  IconDownload,
  IconLayoutList,
  IconListDetails,
  IconPinned,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  type TableState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";

export type DataGridDensity = "normal" | "compact";

export interface DataGridCsvColumn<TData> {
  header: string;
  accessor: (row: TData) => string | number | boolean | null | undefined;
}

export interface DataGridProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Column ID to bind the quick search input to. If omitted, uses globalFilter. */
  filterColumn?: string;
  filterPlaceholder?: string;
  /** Default column pinning state (e.g. `{ left: ["description"], right: ["actions"] }`) */
  initialColumnPinning?: ColumnPinningState;
  /** Default row density ("normal" | "compact") */
  defaultDensity?: DataGridDensity;
  /** Show density toggle in toolbar (default: true) */
  enableDensityToggle?: boolean;
  /** Show CSV export button in toolbar (default: true) */
  enableExport?: boolean;
  /** Base filename for exported CSV (without .csv extension) */
  exportFilename?: string;
  /** Optional custom CSV column definitions for cleaner export output */
  csvColumns?: DataGridCsvColumn<TData>[];
  /** Optional custom slot rendered in the toolbar */
  toolbarActions?: React.ReactNode;
  /** Empty state message */
  emptyMessage?: string;
  /** Default page size (default: 10) */
  defaultPageSize?: number;
  /** Optional click handler for table rows (excluding interactive controls) */
  onRowClick?: (row: TData) => void;
  state?: Partial<TableState>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (originalRow: TData, index: number) => string;
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str =
    value instanceof Date ? value.toISOString() : String(value).trim();
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function DataGrid<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Cari data...",
  initialColumnPinning,
  defaultDensity = "normal",
  enableDensityToggle = true,
  enableExport = true,
  exportFilename = "export-data",
  csvColumns,
  toolbarActions,
  emptyMessage = "Tidak ada data ditemukan.",
  defaultPageSize = 10,
  onRowClick,
  state: controlledState,
  onRowSelectionChange,
  getRowId,
}: DataGridProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(
    initialColumnPinning ?? { left: [], right: [] },
  );
  const [density, setDensity] = React.useState<DataGridDensity>(defaultDensity);

  const rowSelection = controlledState?.rowSelection ?? internalRowSelection;
  const handleRowSelectionChange =
    onRowSelectionChange ?? setInternalRowSelection;

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange,
    onColumnPinningChange: setColumnPinning,
    enableColumnPinning: true,
    getRowId:
      getRowId ??
      ((row, index) => {
        if (
          typeof row === "object" &&
          row !== null &&
          "id" in row &&
          typeof (row as { id?: unknown }).id === "string"
        ) {
          return (row as { id: string }).id;
        }
        return String(index);
      }),
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      columnPinning,
      ...controlledState,
    },
  });

  const searchValue = filterColumn
    ? ((table.getColumn(filterColumn)?.getFilterValue() as string) ?? "")
    : globalFilter;

  const handleSearchChange = (value: string) => {
    if (filterColumn) {
      table.getColumn(filterColumn)?.setFilterValue(value);
    } else {
      setGlobalFilter(value);
    }
  };

  const handleExportCsv = React.useCallback(() => {
    const filteredRows = table.getFilteredRowModel().rows;
    if (filteredRows.length === 0) return;

    let headers: string[] = [];
    let rowsData: string[][] = [];

    if (csvColumns && csvColumns.length > 0) {
      headers = csvColumns.map((col) => escapeCsvCell(col.header));
      rowsData = filteredRows.map((row) =>
        csvColumns.map((col) => escapeCsvCell(col.accessor(row.original))),
      );
    } else {
      const exportableColumns = table
        .getAllLeafColumns()
        .filter(
          (col) =>
            col.getIsVisible() &&
            col.id !== "select" &&
            col.id !== "actions" &&
            col.id !== "proof",
        );

      headers = exportableColumns.map((col) => {
        const headerDef = col.columnDef.header;
        if (typeof headerDef === "string") return escapeCsvCell(headerDef);
        return escapeCsvCell(col.id);
      });

      rowsData = filteredRows.map((row) =>
        exportableColumns.map((col) => {
          const val = row.getValue(col.id);
          if (
            typeof val === "object" &&
            val !== null &&
            !(val instanceof Date)
          ) {
            if (
              "name" in val &&
              typeof (val as { name?: unknown }).name === "string"
            ) {
              return escapeCsvCell((val as { name: string }).name);
            }
            return escapeCsvCell(JSON.stringify(val));
          }
          return escapeCsvCell(val);
        }),
      );
    }

    const csvContent = `\uFEFF${[
      headers.join(","),
      ...rowsData.map((r) => r.join(",")),
    ].join("\r\n")}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute("download", `${exportFilename}-${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [csvColumns, exportFilename, table]);

  const hideableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  return (
    <div className="w-full space-y-3">
      {/* ── Toolbar: Search, Actions, Density, Column Visibility, Export ── */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:max-w-xs">
            <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={filterPlaceholder}
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="h-9 pr-8 pl-9 text-sm"
            />
            {searchValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => handleSearchChange("")}
                aria-label="Hapus pencarian"
              >
                <IconX className="size-3.5" />
              </Button>
            )}
          </div>
          {toolbarActions}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Density Switcher (Normal vs Compact) */}
          {enableDensityToggle && (
            <fieldset
              aria-label="Kerapatan baris tabel"
              className="inline-flex h-9 items-center rounded-lg border border-border bg-muted p-0.5"
            >
              <button
                type="button"
                onClick={() => setDensity("normal")}
                title="Tampilan Normal"
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all",
                  density === "normal"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <IconListDetails className="size-3.5" />
                <span className="hidden lg:inline">Normal</span>
              </button>
              <button
                type="button"
                onClick={() => setDensity("compact")}
                title="Tampilan Rapat (Compact)"
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all",
                  density === "compact"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <IconLayoutList className="size-3.5" />
                <span className="hidden lg:inline">Rapat</span>
              </button>
            </fieldset>
          )}

          {/* Column Visibility & Pinning Menu */}
          {hideableColumns.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                  <IconAdjustmentsHorizontal className="size-4" />
                  <span>Kolom</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Visibilitas & Pin Kolom
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hideableColumns.map((column) => {
                  const isPinned = column.getIsPinned();
                  const label =
                    typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id;
                  return (
                    <div
                      key={column.id}
                      className="flex items-center justify-between gap-1 pr-1"
                    >
                      <DropdownMenuCheckboxItem
                        className="flex-1 capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        <span className="truncate">{label}</span>
                      </DropdownMenuCheckboxItem>
                      {column.getCanPin() &&
                        column.id !== "select" &&
                        column.id !== "actions" && (
                          <button
                            type="button"
                            className={cn(
                              "inline-flex size-7 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer",
                              isPinned
                                ? "border-secondary/40 bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/90"
                                : "border-border/60 bg-background text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
                            )}
                            title={
                              isPinned
                                ? `Lepas pin kolom (${isPinned === "left" ? "Kiri" : "Kanan"})`
                                : "Pin kolom ke sisi kiri"
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              column.pin(isPinned ? false : "left");
                            }}
                          >
                            <IconPinned
                              className={cn(
                                "size-4",
                                isPinned
                                  ? "text-secondary-foreground"
                                  : "opacity-70",
                              )}
                            />
                            <span className="sr-only">
                              {isPinned ? "Lepas pin kolom" : "Pin kolom"}
                            </span>
                          </button>
                        )}
                    </div>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export CSV Button */}
          {enableExport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={handleExportCsv}
              disabled={table.getFilteredRowModel().rows.length === 0}
            >
              <IconDownload className="size-4" />
              <span>Ekspor CSV</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Table with Sticky Column Pinning & Density Support ── */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-grid-header backdrop-blur-none">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-grid-header hover:bg-grid-header border-b border-border"
              >
                {headerGroup.headers.map((header) => {
                  const isPinned = header.column.getIsPinned();
                  const leftPinnedCols =
                    table.getState().columnPinning.left ?? [];
                  const isAfterSelect =
                    isPinned === "left" &&
                    leftPinnedCols[0] === "select" &&
                    header.column.id !== "select";
                  const isLastLeftPinned =
                    isPinned === "left" &&
                    leftPinnedCols[leftPinnedCols.length - 1] ===
                      header.column.id;

                  const canSort =
                    header.column.getCanSort() &&
                    header.column.id !== "select" &&
                    header.column.id !== "actions";
                  const isSorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "transition-colors text-foreground font-semibold bg-grid-header",
                        density === "compact"
                          ? "h-8 px-2.5 py-1.5 text-xs"
                          : "h-10 px-4 py-2.5 text-xs font-semibold",
                        header.column.id === "select" && "w-10 min-w-10 px-3",
                        header.column.id === "actions" &&
                          "w-px px-3 text-center",
                        isPinned === "left" &&
                          "sticky z-30 border-r border-border",
                        isPinned === "left" &&
                          (isAfterSelect ? "left-10" : "left-0"),
                        isLastLeftPinned &&
                          "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                        isPinned === "right" &&
                          "sticky right-0 z-30 border-l border-border shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center gap-1.5",
                            header.column.id === "actions" && "justify-center",
                          )}
                        >
                          {canSort ? (
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className="group/header inline-flex items-center gap-1.5 truncate text-left font-semibold text-foreground hover:text-foreground transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:underline"
                            >
                              <span className="truncate">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </span>
                              <span className="shrink-0 text-muted-foreground transition-colors group-hover/header:text-foreground">
                                {isSorted === "asc" ? (
                                  <IconChevronUp className="size-3.5 text-primary" />
                                ) : isSorted === "desc" ? (
                                  <IconChevronDown className="size-3.5 text-primary" />
                                ) : (
                                  <IconArrowsSort className="size-3.5 opacity-0 group-hover/header:opacity-100 transition-opacity" />
                                )}
                              </span>
                            </button>
                          ) : (
                            <span className="truncate">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </span>
                          )}
                          {isPinned &&
                            header.column.getCanPin() &&
                            header.column.id !== "select" &&
                            header.column.id !== "actions" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  header.column.pin(false);
                                }}
                                className="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-secondary/40 bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/90 transition-all cursor-pointer"
                                title={`Kolom di-pin (${isPinned === "left" ? "Kiri" : "Kanan"}). Klik untuk lepas pin.`}
                              >
                                <IconPinned className="size-3.5 text-secondary-foreground" />
                                <span className="sr-only">Lepas pin</span>
                              </button>
                            )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={
                    onRowClick
                      ? (e) => {
                          const target = e.target as HTMLElement;
                          if (
                            target.closest(
                              'button, a, input, select, textarea, [role="button"], [role="menuitem"], [data-radix-collection-item]',
                            )
                          ) {
                            return;
                          }
                          onRowClick(row.original);
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            const target = e.target as HTMLElement;
                            if (
                              target.closest(
                                'button, a, input, select, textarea, [role="button"], [role="menuitem"], [data-radix-collection-item]',
                              )
                            ) {
                              return;
                            }
                            e.preventDefault();
                            onRowClick(row.original);
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    "group/row bg-card hover:bg-grid-row-hover data-[state=selected]:bg-grid-row-selected border-b border-border/70 transition-colors",
                    onRowClick &&
                      "cursor-pointer focus-visible:outline-none focus-visible:bg-grid-row-hover",
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isPinned = cell.column.getIsPinned();
                    const leftPinnedCols =
                      table.getState().columnPinning.left ?? [];
                    const isAfterSelect =
                      isPinned === "left" &&
                      leftPinnedCols[0] === "select" &&
                      cell.column.id !== "select";
                    const isLastLeftPinned =
                      isPinned === "left" &&
                      leftPinnedCols[leftPinnedCols.length - 1] ===
                        cell.column.id;

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "transition-colors bg-card group-hover/row:bg-grid-row-hover group-data-[state=selected]/row:bg-grid-row-selected",
                          density === "compact"
                            ? "px-2.5 py-1.5 text-xs"
                            : "px-4 py-3 text-sm",
                          cell.column.id === "select" && "w-10 min-w-10 px-3",
                          cell.column.id === "actions" &&
                            "w-px px-3 text-center",
                          isPinned === "left" &&
                            "sticky z-20 border-r border-border",
                          isPinned === "left" &&
                            (isAfterSelect ? "left-10" : "left-0"),
                          isLastLeftPinned &&
                            "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                          isPinned === "right" &&
                            "sticky right-0 z-20 border-l border-border shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination Controls ── */}
      <div className="flex flex-col gap-3 px-1 py-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 ? (
            <span>
              {table.getFilteredSelectedRowModel().rows.length} dari{" "}
              {table.getFilteredRowModel().rows.length} baris dipilih.
            </span>
          ) : (
            <span>
              Menampilkan {table.getRowModel().rows.length} dari{" "}
              {table.getFilteredRowModel().rows.length} baris data.
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-medium text-muted-foreground">
              Baris per halaman
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center text-xs font-medium">
            Hal {table.getState().pagination.pageIndex + 1} dari{" "}
            {Math.max(1, table.getPageCount())}
          </div>
          <div className="flex items-center space-x-1.5">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ke halaman pertama</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ke halaman sebelumnya</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ke halaman berikutnya</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ke halaman terakhir</span>
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
