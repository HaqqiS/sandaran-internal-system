export interface GalleryMediaItem {
  id: string;
  url: string;
  publicId: string;
  resourceType: string;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: Date | string;
  report: {
    id: string;
    slug: string;
    reportDate: Date | string;
    weather?: string | null;
    taskDescription: string;
    user: {
      id?: string;
      name: string;
      image?: string | null;
    };
  };
}

export interface GalleryDayGroup {
  dateKey: string;
  dateObj: Date;
  formattedDate: string;
  weathers: string[];
  photos: GalleryMediaItem[];
}
