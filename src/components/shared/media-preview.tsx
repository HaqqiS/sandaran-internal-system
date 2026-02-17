"use client";

import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";

interface MediaPreviewProps {
  url: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaPreview({ url, open, onOpenChange }: MediaPreviewProps) {
  if (!url) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none sm:max-w-none w-auto h-auto border-0 bg-transparent p-0 shadow-none">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="relative flex items-center justify-center">
          {/* biome-ignore lint: using img for Cloudinary external URLs */}
          <img
            src={url}
            alt="Full size preview"
            className="max-h-[80vh] w-auto max-w-[90vw] md:max-h-[90vh] md:max-w-[90vw] rounded-lg object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
