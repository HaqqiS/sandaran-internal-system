"use client";

import type * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";

export interface ResponsiveFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel?: string;
  onSubmit?: () => void;
  cancelLabel?: string;
  isPending?: boolean;
  trigger?: React.ReactNode;
  contentClassName?: string;
  dialogClassName?: string;
  drawerClassName?: string;
  children: React.ReactNode;
}

export function ResponsiveFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  onSubmit,
  cancelLabel = "Batal",
  isPending = false,
  trigger,
  contentClassName,
  dialogClassName,
  drawerClassName,
  children,
}: ResponsiveFormDialogProps) {
  const isMobile = useIsMobile();
  const hasFooter = Boolean(submitLabel && onSubmit);

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent
          className={cn(
            "gap-0 overflow-hidden p-0 sm:max-w-lg",
            dialogClassName,
          )}
        >
          <div className="flex max-h-[90dvh] flex-col">
            <div className="shrink-0 border-b px-6 pt-5 pb-4 pr-12">
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="mt-1 text-sm">
                  {description}
                </DialogDescription>
              )}
            </div>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto px-6 py-5",
                contentClassName,
              )}
            >
              {children}
            </div>
            {hasFooter && (
              <div className="flex shrink-0 justify-end gap-2 rounded-b-xl border-t bg-muted/50 px-6 py-3.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange?.(false)}
                  disabled={isPending}
                >
                  {cancelLabel}
                </Button>
                <Button onClick={onSubmit} disabled={isPending}>
                  {submitLabel}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className={cn("flex h-[85dvh] flex-col", drawerClassName)}>
        <DrawerHeader className="shrink-0 border-b px-4 pb-3 pt-3 text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-4 py-4 scroll-pb-24",
            contentClassName,
          )}
          data-vaul-no-drag
        >
          {children}
        </div>
        {hasFooter && (
          <DrawerFooter className="mt-0 flex shrink-0 flex-row gap-2 border-t px-4 py-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange?.(false)}
              disabled={isPending}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={onSubmit}
              disabled={isPending}
            >
              {submitLabel}
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
