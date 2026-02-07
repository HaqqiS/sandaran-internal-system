"use client"

import { useForm } from "@tanstack/react-form"
import type { DailyReportTask } from "generated/prisma"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { useAddReportTask, useUpdateReportTask } from "~/hooks"

const taskSchema = z.object({
  taskName: z.string().min(1, "Task name is required"),
  workerCount: z.number().min(0),
  progress: z.number().min(0).max(100),
  notes: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskFormProps {
  projectId: string
  reportId: string
  task?: DailyReportTask
  onSuccess: () => void
  onCancel: () => void
}

export function TaskForm({
  projectId,
  reportId,
  task,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const addTask = useAddReportTask()
  const updateTask = useUpdateReportTask()
  const isEditMode = !!task

  const form = useForm({
    defaultValues: {
      taskName: task?.taskName ?? "",
      workerCount: task?.workerCount ?? 0,
      progress: task?.progress ?? 0,
      notes: task?.notes ?? "",
    } as TaskFormValues,
    validators: {
      onSubmit: taskSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditMode && task) {
          await updateTask.mutateAsync({
            projectId,
            taskId: task.id,
            taskName: value.taskName,
            workerCount: value.workerCount,
            progress: value.progress,
            notes: value.notes || undefined,
          })
          toast.success("Task updated")
        } else {
          await addTask.mutateAsync({
            projectId,
            reportId,
            taskName: value.taskName,
            workerCount: value.workerCount,
            progress: value.progress,
            notes: value.notes || undefined,
          })
          toast.success("Task added")
        }
        onSuccess()
      } catch {
        toast.error("Failed to save task")
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
      className="space-y-4 rounded-lg border p-4 shadow-sm bg-muted/30"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Task Name - Full Width on Mobile, 1 col on Desktop */}
        <div className="sm:col-span-2">
          <form.Field name="taskName">
            {(field) => (
              <FieldGroup>
                <Field>
                  <FieldLabel>Task Name</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g. Wall plastering"
                    autoFocus
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              </FieldGroup>
            )}
          </form.Field>
        </div>

        {/* Worker Count */}
        <form.Field name="workerCount">
          {(field) => (
            <FieldGroup>
              <Field>
                <FieldLabel>Workers</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(Number(e.target.value) || 0)
                  }
                  onBlur={field.handleBlur}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            </FieldGroup>
          )}
        </form.Field>

        {/* Progress */}
        <form.Field name="progress">
          {(field) => (
            <FieldGroup>
              <Field>
                <FieldLabel>Progress (%)</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(Number(e.target.value) || 0)
                  }
                  onBlur={field.handleBlur}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            </FieldGroup>
          )}
        </form.Field>

        {/* Notes - Full Width */}
        <div className="sm:col-span-2">
          <form.Field name="notes">
            {(field) => (
              <FieldGroup>
                <Field>
                  <FieldLabel>Notes (Optional)</FieldLabel>
                  <Textarea
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    rows={2}
                    placeholder="Additional details..."
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              </FieldGroup>
            )}
          </form.Field>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting} size="sm">
              {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Add Task"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
