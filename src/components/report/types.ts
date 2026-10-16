export type ReportViewMode = "grid" | "list";

export interface ReportTaskItemData {
  id: string;
  taskName: string;
  workerCount: number;
  progress: number;
  notes?: string | null;
}

export interface ReportItemData {
  id: string;
  slug: string;
  userId?: string;
  reportDate: Date | string;
  taskDescription: string;
  progressPercent: number;
  weather?: string | null;
  location?: string | null;
  issues?: string | null;
  totalWorkers: number;
  user: { id?: string; name: string; image?: string | null };
  media: Array<{
    id: string;
    url: string;
    publicId: string;
    createdAt?: Date | string;
    reportId?: string;
  }>;
  tasks: ReportTaskItemData[];
  _count?: { comments: number };
}

export interface ReportCardProps {
  report: ReportItemData;
  projectSlug: string;
  onEdit?: (report: ReportItemData) => void;
  onDelete?: (report: ReportItemData) => void;
}

export interface ReportListItemProps {
  report: ReportItemData;
  projectSlug: string;
  onEdit?: (report: ReportItemData) => void;
  onDelete?: (report: ReportItemData) => void;
}
