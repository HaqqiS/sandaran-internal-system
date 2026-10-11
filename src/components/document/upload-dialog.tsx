"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import {
  type DocumentFormDraft,
  type DocumentFormValues,
  UploadForm,
} from "./upload-form";

interface UploadDialogProps {
  projectId: string;
  projectSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function UploadDialog({
  projectId,
  projectSlug,
  open,
  onOpenChange,
  onSuccess,
  children,
}: UploadDialogProps) {
  const title = "Unggah Dokumen";
  const descriptionText =
    "Unggah file desain, gambar teknis, spesifikasi, dll.";
  const [draft, setDraft] = useState<DocumentFormDraft>({});
  const [isPending, setIsPending] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const formRef = useRef<{ getValues: () => DocumentFormValues }>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && formRef.current) {
      setDraft(formRef.current.getValues());
    }
    onOpenChange(isOpen);
  };

  const handleSuccess = () => {
    setDraft({});
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={descriptionText}
      formId="upload-doc-form"
      submitLabel={isPending ? "Mengunggah..." : "Unggah Dokumen"}
      isPending={isPending}
      submitDisabled={!hasFile}
      trigger={children}
      dialogClassName="sm:max-w-xl"
    >
      <UploadForm
        id="upload-doc-form"
        ref={formRef}
        projectId={projectId}
        projectSlug={projectSlug}
        draftValues={draft}
        onPendingChange={setIsPending}
        onFileStatusChange={setHasFile}
        onSuccess={handleSuccess}
      />
    </ResponsiveFormDialog>
  );
}
