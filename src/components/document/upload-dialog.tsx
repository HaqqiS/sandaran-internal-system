"use client"

import { useForm } from "@tanstack/react-form"
import type { DocumentType } from "generated/prisma"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { FileUpload } from "~/components/shared/file-upload"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { useUploadDocument } from "~/hooks/useDocument"

const documentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fileType: z.enum([
    "DESIGN",
    "DRAWING",
    "REFERENCE",
    "SPECIFICATION",
    "OTHER",
  ]),
  version: z.string().optional(),
  // File fields will be handled separately but validated before submit
})

type DocumentFormValues = z.infer<typeof documentSchema>

interface UploadDialogProps {
  projectId: string
  projectSlug: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UploadDialog({
  projectId,
  projectSlug,
  open,
  onOpenChange,
  onSuccess,
}: UploadDialogProps) {
  const uploadDocument = useUploadDocument()

  // File state
  const [fileData, setFileData] = useState<{
    url: string
    publicId: string
    fileName: string
    fileSize: number
    mimeType: string
  } | null>(null)

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      fileType: "OTHER" as DocumentType,
      version: "",
    } as DocumentFormValues,
    validators: {
      onSubmit: documentSchema,
    },
    onSubmit: async ({ value }) => {
      if (!fileData) {
        toast.error("Please upload a file")
        return
      }

      try {
        await uploadDocument.mutateAsync({
          projectId,
          fileName: fileData.fileName,
          fileType: value.fileType,
          publicId: fileData.publicId,
          url: fileData.url,
          fileSize: fileData.fileSize,
          mimeType: fileData.mimeType,
          title: value.title || undefined,
          description: value.description || undefined,
          version: value.version || undefined,
        })
        toast.success("Document uploaded successfully")
        onOpenChange(false)
        onSuccess?.()

        // Reset file state
        setFileData(null)
      } catch {
        // Error handled by mutation
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload design files, drawings, or specifications.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          {/* File Upload Section */}
          <div className="space-y-2">
            <FieldLabel>File</FieldLabel>
            <FileUpload
              projectSlug={projectSlug}
              type="documents"
              value={fileData?.url}
              onChange={(url, publicId, fileName, size, mimeType) => {
                setFileData({
                  url,
                  publicId,
                  fileName,
                  fileSize: size,
                  mimeType,
                })
              }}
              onRemove={() => setFileData(null)}
            />
          </div>

          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="title"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Title (Optional)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Display title"
                    />
                  </Field>
                )}
              />

              <form.Field
                name="fileType"
                children={(field) => (
                  <Field>
                    <FieldLabel>Document Type</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as DocumentType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DESIGN">Design File</SelectItem>
                        <SelectItem value="DRAWING">
                          Technical Drawing
                        </SelectItem>
                        <SelectItem value="SPECIFICATION">
                          Specification
                        </SelectItem>
                        <SelectItem value="REFERENCE">Reference</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            <form.Field
              name="version"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Version (Optional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. v1.0, Rev A"
                  />
                </Field>
              )}
            />

            <form.Field
              name="description"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Brief description of the document content..."
                    rows={3}
                  />
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || !fileData}
                >
                  {isSubmitting ? "Uploading..." : "Upload Document"}
                </Button>
              )}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
