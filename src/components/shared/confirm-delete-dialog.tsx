"use client";

import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import type * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  itemName?: string | null;
  description?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  showIcon?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Hapus Data",
  itemName,
  description,
  onConfirm,
  isPending = false,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  showIcon = false,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {showIcon && (
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <IconAlertTriangle className="size-5" />
            </AlertDialogMedia>
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? (
              <>
                Apakah Anda yakin ingin menghapus{" "}
                {itemName ? (
                  <span className="inline-block max-w-[200px] align-bottom font-semibold truncate sm:max-w-[280px] text-foreground">
                    &quot;{itemName}&quot;
                  </span>
                ) : (
                  "item ini"
                )}
                ? Tindakan ini tidak dapat dibatalkan.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
