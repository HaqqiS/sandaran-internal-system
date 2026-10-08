"use client";

import type { DailyReportTask } from "@prisma/client";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "~/components/shared/confirm-delete-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useDeleteReportTask } from "~/hooks";
import { cn } from "~/lib/utils";
import { TaskForm } from "./task-form";

interface TaskListProps {
  projectId: string;
  reportId: string;
  tasks: DailyReportTask[];
  canEdit: boolean;
}

export function TaskList({
  projectId,
  reportId,
  tasks,
  canEdit,
}: TaskListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] =
    useState<DailyReportTask | null>(null);
  const deleteTask = useDeleteReportTask();

  const handleDelete = async () => {
    if (!deleteTaskTarget) return;
    try {
      await deleteTask.mutateAsync({ projectId, taskId: deleteTaskTarget.id });
      toast.success("Tugas berhasil dihapus");
      setDeleteTaskTarget(null);
    } catch {
      toast.error("Gagal menghapus Tugas");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* <h3 className="text-lg font-semibold">Rincian Tugas</h3> */}
        {canEdit && !isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Tambah Tugas
          </Button>
        )}
      </div>

      {isAdding && (
        <TaskForm
          projectId={projectId}
          reportId={reportId}
          onSuccess={() => setIsAdding(false)}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {tasks.length === 0 && !isAdding ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Belum ada rincian tugas ditambahkan.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile View (Cards) - Visible only on small screens < md */}
          <div className="grid gap-4 md:hidden">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border p-4 shadow-sm bg-card"
              >
                {editingTaskId === task.id ? (
                  <TaskForm
                    projectId={projectId}
                    reportId={reportId}
                    task={task}
                    onSuccess={() => setEditingTaskId(null)}
                    onCancel={() => setEditingTaskId(null)}
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{task.taskName}</h4>
                        {task.notes && (
                          <p className="text-sm text-muted-foreground">
                            {task.notes}
                          </p>
                        )}
                      </div>
                      {canEdit && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingTaskId(task.id)}
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTaskTarget(task)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Pekerja:</span>
                        <span className="font-medium">{task.workerCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Progres:</span>
                        <span
                          className={cn(
                            "font-medium",
                            task.progress === 100
                              ? "text-green-600"
                              : "text-blue-600",
                          )}
                        >
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop View (Table) - Visible on md+ */}
          <div className="hidden rounded-xl border overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[35%] text-xs font-medium">
                    Nama Pekerjaan
                  </TableHead>
                  <TableHead className="text-xs font-medium">
                    Jumlah Pekerja
                  </TableHead>
                  <TableHead className="text-xs font-medium">Progres</TableHead>
                  <TableHead className="text-xs font-medium">Catatan</TableHead>
                  {canEdit && (
                    <TableHead className="w-[110px] text-center text-xs font-medium">
                      Aksi
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) =>
                  editingTaskId === task.id ? (
                    <TableRow key={task.id} className="bg-muted/10">
                      <TableCell colSpan={canEdit ? 5 : 4} className="p-4">
                        <TaskForm
                          projectId={projectId}
                          reportId={reportId}
                          task={task}
                          onSuccess={() => setEditingTaskId(null)}
                          onCancel={() => setEditingTaskId(null)}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {task.taskName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {task.workerCount} orang
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "w-fit text-xs font-medium",
                            task.progress === 100
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
                          )}
                        >
                          {task.progress}%
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {task.notes || "-"}
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => setEditingTaskId(task.id)}
                              aria-label={`Edit tugas ${task.taskName}`}
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTaskTarget(task)}
                              aria-label={`Hapus tugas ${task.taskName}`}
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteTaskTarget}
        onOpenChange={(open) => !open && setDeleteTaskTarget(null)}
        title="Hapus Tugas"
        itemName={deleteTaskTarget?.taskName}
        onConfirm={handleDelete}
        isPending={deleteTask.isPending}
      />
    </div>
  );
}
