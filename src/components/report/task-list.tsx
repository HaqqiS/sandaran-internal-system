"use client"

import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react"
import type { DailyReportTask } from "generated/prisma"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { useDeleteReportTask } from "~/hooks"
import { cn } from "~/lib/utils"
import { TaskForm } from "./task-form"

interface TaskListProps {
  projectId: string
  reportId: string
  tasks: DailyReportTask[]
  canEdit: boolean
}

export function TaskList({
  projectId,
  reportId,
  tasks,
  canEdit,
}: TaskListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const deleteTask = useDeleteReportTask()

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return
    try {
      await deleteTask.mutateAsync({ projectId, taskId })
      toast.success("Task deleted")
    } catch {
      toast.error("Failed to delete task")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Breakdown</h3>
        {canEdit && !isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Task
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
          No tasks added yet.
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
                            onClick={() => handleDelete(task.id)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Workers:</span>
                        <span className="font-medium">{task.workerCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Progress:</span>
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
          <div className="hidden rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Task Name</TableHead>
                  <TableHead>Workers</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Notes</TableHead>
                  {canEdit && <TableHead className="w-[100px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) =>
                  editingTaskId === task.id ? (
                    <TableRow key={task.id}>
                      <TableCell colSpan={5} className="p-4">
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
                      <TableCell className="font-medium">
                        {task.taskName}
                      </TableCell>
                      <TableCell>{task.workerCount}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {task.notes || "-"}
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <div className="flex items-center gap-2">
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
                              onClick={() => handleDelete(task.id)}
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
    </div>
  )
}
