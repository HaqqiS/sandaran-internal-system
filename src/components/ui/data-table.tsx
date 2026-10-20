"use client";

import {
  DataGrid,
  type DataGridCsvColumn,
  type DataGridDensity,
  type DataGridProps,
} from "~/components/ui/data-grid";

export type DataTableProps<TData, TValue> = DataGridProps<TData, TValue>;
export type { DataGridCsvColumn, DataGridDensity };

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  return <DataGrid {...props} />;
}
