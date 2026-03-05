"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { TransactionForm } from "./transaction-form";

interface TransactionDialogProps {
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: "IN" | "OUT";
  item: { id: string; name: string; unit: string } | null;
  onSuccess: () => void;
}

export function TransactionDialog({
  projectId,
  isOpen,
  onOpenChange,
  type,
  item,
  onSuccess,
}: TransactionDialogProps) {
  const isMobile = useIsMobile();
  const title = type === "IN" ? "Stock In" : "Stock Out";
  const directionText = type === "IN" ? "incoming" : "outgoing";
  const description = (
    <>
      Record {directionText} stock for <strong>{item?.name}</strong>.
    </>
  );

  if (!isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {item && (
            <TransactionForm
              projectId={projectId}
              itemId={item.id}
              itemName={item.name}
              unit={item.unit}
              defaultType={type}
              onSuccess={onSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="flex flex-col h-[85dvh]">
        <DrawerHeader className="text-left shrink-0">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {item && (
            <TransactionForm
              projectId={projectId}
              itemId={item.id}
              itemName={item.name}
              unit={item.unit}
              defaultType={type}
              onSuccess={onSuccess}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
