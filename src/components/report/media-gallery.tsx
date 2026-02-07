"use client"

import { IconX, IconZoomIn } from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog"

interface MediaGalleryProps {
  media: { id: string; url: string; publicId: string }[]
  onDelete?: (mediaId: string) => void
  canDelete?: boolean
}

export function MediaGallery({
  media,
  onDelete,
  canDelete = false,
}: MediaGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  if (media.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">No images</p>
      </div>
    )
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((item) => (
          <button
            type="button"
            key={item.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border bg-muted text-left"
            onClick={() => setLightboxImage(item.url)}
          >
            {/* biome-ignore lint: using img for Cloudinary external URLs */}
            <img
              src={item.url}
              alt="Report media"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
              <IconZoomIn className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            {canDelete && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.id)
                }}
              >
                <IconX className="h-3 w-3" />
              </Button>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog
        open={!!lightboxImage}
        onOpenChange={() => setLightboxImage(null)}
      >
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          {lightboxImage && (
            // biome-ignore lint: using img for Cloudinary external URLs
            <img
              src={lightboxImage}
              alt="Full size"
              className="max-h-[90vh] w-auto rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
