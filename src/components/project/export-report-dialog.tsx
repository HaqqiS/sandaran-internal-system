"use client";

import { IconFileSpreadsheet, IconLoader2 } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExportReportDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(value: string): string {
  if (!value) return "";
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ExportReportDialog({
  projectId,
  open,
  onOpenChange,
}: ExportReportDialogProps) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleExport = async () => {
    if (!selectedMonth) {
      toast.error("Pilih bulan terlebih dahulu.");
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading("Sedang membuat laporan Excel…");

    try {
      const res = await fetch(
        `/api/projects/${projectId}/export?month=${selectedMonth}`,
      );

      if (!res.ok) {
        // Coba parse pesan error dari server
        let errorMsg = "Gagal mengekspor laporan.";
        try {
          const json = (await res.json()) as { error?: string };
          if (json.error) errorMsg = json.error;
        } catch {
          // ignore parse error
        }
        throw new Error(errorMsg);
      }

      // Trigger download di browser
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `laporan_${selectedMonth}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      toast.success(
        `Laporan ${formatMonthLabel(selectedMonth)} berhasil diunduh!`,
        { id: toastId },
      );
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.",
        { id: toastId },
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Ekspor Laporan ke Excel
          </DialogTitle>
          <DialogDescription>
            Pilih periode bulan yang ingin diekspor. File Excel akan mencakup
            seluruh daily report beserta task dan foto dokumentasi.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="export-month">Periode Bulan</Label>
            <input
              id="export-month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              max={getCurrentMonth()}
              disabled={isDownloading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {selectedMonth && (
              <p className="text-xs text-muted-foreground">
                Mengekspor laporan bulan{" "}
                <span className="font-medium text-foreground">
                  {formatMonthLabel(selectedMonth)}
                </span>
              </p>
            )}
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              ⚠️ Proses ekspor mungkin membutuhkan beberapa detik karena memuat
              foto dokumentasi dari server.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDownloading}
          >
            Batal
          </Button>
          <Button
            onClick={handleExport}
            disabled={isDownloading || !selectedMonth}
            className="gap-2"
          >
            {isDownloading ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Membuat Laporan…
              </>
            ) : (
              <>
                <IconFileSpreadsheet className="h-4 w-4" />
                Unduh Laporan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
