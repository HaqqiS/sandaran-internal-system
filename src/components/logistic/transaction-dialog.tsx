"use client";

import { useRef, useState } from "react";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import {
  TransactionForm,
  type TransactionFormDraft,
  type TransactionFormValues,
} from "./transaction-form";

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
  const title = type === "IN" ? "Barang Masuk" : "Barang Keluar";
  const description =
    type === "IN"
      ? `Catat penambahan stok untuk ${item?.name}`
      : `Catat pengeluaran stok untuk ${item?.name}`;
  const [draft, setDraft] = useState<TransactionFormDraft>({});
  const formRef = useRef<{ getValues: () => TransactionFormValues }>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open && formRef.current) {
      setDraft(formRef.current.getValues());
    }
    onOpenChange(open);
  };

  const handleSuccess = () => {
    setDraft({});
    onSuccess();
  };

  return (
    <ResponsiveFormDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
    >
      {item && (
        <TransactionForm
          ref={formRef}
          projectId={projectId}
          itemId={item.id}
          itemName={item.name}
          unit={item.unit}
          defaultType={type}
          draftValues={draft}
          onSuccess={handleSuccess}
        />
      )}
    </ResponsiveFormDialog>
  );
}
