"use client"

import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { useAddEmergencyBalance } from "~/hooks/useEmergency"

const fundSchema = z.object({
  amount: z
    .string()
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  description: z.string().min(1, "Description is required"),
})

interface FundDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FundDialog({ projectId, open, onOpenChange }: FundDialogProps) {
  const addBalance = useAddEmergencyBalance()

  const form = useForm({
    defaultValues: {
      amount: "",
      description: "",
    },
    validators: {
      onChange: fundSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await addBalance.mutateAsync({
          projectId,
          amount: Number(value.amount),
          description: value.description,
        })
        toast.success("Funds added successfully")
        onOpenChange(false)
        form.reset()
      } catch (error) {
        toast.error("Failed to add funds")
        console.error(error)
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Emergency Fund</DialogTitle>
          <DialogDescription>
            Add balance to the project's emergency fund. This will be recorded
            as a deposit.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="amount"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Amount (Rp)</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. 1000000"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          <form.Field
            name="description"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Source / Description</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Top up from Finance"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addBalance.isPending}>
              {addBalance.isPending ? "Adding..." : "Add Funds"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
