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
  formId?: string; // HTML form id to connect footer submit button
  submitLabel?: string;
  onSubmit?: () => void; // Fallback handler if not using native formId
  cancelLabel?: string;
  isPending?: boolean;
  submitDisabled?: boolean;
  showCancelOnly?: boolean;
  customFooter?: React.ReactNode;
  trigger?: React.ReactNode;
  contentClassName?: string;
  dialogClassName?: string;
  drawerClassName?: string;
  children: React.ReactNode;
}

interface ShellProps
  extends Omit<
    ResponsiveFormDialogProps,
    "open" | "onOpenChange" | "trigger" | "dialogClassName" | "drawerClassName"
  > {
  onCancel: () => void;
  isDrawer?: boolean;
}

function Shell({
  title,
  description,
  formId,
  submitLabel,
  onSubmit,
  cancelLabel = "Batal",
  isPending = false,
  submitDisabled = false,
  showCancelOnly = false,
  customFooter,
  contentClassName,
  onCancel,
  children,
  isDrawer,
}: ShellProps) {
  const Title = isDrawer ? DrawerTitle : DialogTitle;
  const Desc = isDrawer ? DrawerDescription : DialogDescription;

  const hasDefaultFooter = Boolean(
    formId || onSubmit || submitLabel || showCancelOnly,
  );
  const showFooter = Boolean(customFooter || hasDefaultFooter);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* HEADER (shrink-0) */}
      <header className="shrink-0 border-b px-4 py-3 pr-12 sm:px-5">
        <Title className="text-base font-semibold">{title}</Title>
        {description && (
          <Desc className="mt-0.5 text-xs text-muted-foreground">
            {description}
          </Desc>
        )}
      </header>

      {/* BODY (satu-satunya area scroll) */}
      <div
        data-vaul-no-drag
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 scroll-pb-24",
          contentClassName,
        )}
      >
        {children}
      </div>

      {/* FOOTER (shrink-0) */}
      {showFooter && (
        <footer
          className={cn(
            "shrink-0 flex gap-2 border-t bg-background px-4 py-3 sm:justify-end sm:px-5",
            "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          )}
        >
          {customFooter ? (
            customFooter
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
                className="flex-1 sm:flex-none"
              >
                {cancelLabel}
              </Button>
              {submitLabel && !showCancelOnly && (
                <Button
                  type={formId ? "submit" : "button"}
                  form={formId}
                  onClick={!formId ? onSubmit : undefined}
                  disabled={isPending || submitDisabled}
                  className="flex-1 sm:flex-none"
                >
                  {submitLabel}
                </Button>
              )}
            </>
          )}
        </footer>
      )}
    </div>
  );
}

export function ResponsiveFormDialog(props: ResponsiveFormDialogProps) {
  const {
    open,
    onOpenChange,
    trigger,
    dialogClassName,
    drawerClassName,
    ...rest
  } = props;
  const isMobile = useIsMobile();
  const close = () => onOpenChange?.(false);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent
          className={cn(
            "flex max-h-[88dvh] flex-col overflow-hidden",
            drawerClassName,
          )}
        >
          <Shell {...rest} onCancel={close} isDrawer />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          dialogClassName,
        )}
      >
        <Shell {...rest} onCancel={close} />
      </DialogContent>
    </Dialog>
  );
}
