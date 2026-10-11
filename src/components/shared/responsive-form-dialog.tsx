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
            <div className="shrink-0 border-b px-5 py-3 pr-12">
              <DialogTitle className="text-base font-semibold">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
            </div>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto px-5 py-4",
                contentClassName,
              )}
            >
              {children}
            </div>
            {hasFooter && (
              <div className="sticky bottom-0 z-10 flex shrink-0 justify-end gap-2 border-t bg-muted/40 backdrop-blur-xs px-5 py-3">
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
      <DrawerContent
        className={cn("flex max-h-[88dvh] flex-col", drawerClassName)}
      >
        <DrawerHeader className="shrink-0 border-b px-4 py-2.5 text-left">
          <DrawerTitle className="text-base font-semibold">{title}</DrawerTitle>
          {description && (
            <DrawerDescription className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </DrawerDescription>
          )}
        </DrawerHeader>
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-4 py-3.5 scroll-pb-20",
            contentClassName,
          )}
          data-vaul-no-drag
        >
          {children}
        </div>
        {hasFooter && (
          <DrawerFooter className="sticky bottom-0 z-10 mt-0 flex shrink-0 flex-row gap-2 border-t bg-background/95 backdrop-blur-xs px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
