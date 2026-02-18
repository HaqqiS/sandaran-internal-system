"use client";

import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useDeleteUser } from "~/hooks/useUser";

interface DeleteUserDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
}: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    if (!user) return;
    deleteUser.mutate(
      { userId: user.id },
      {
        onSuccess: () => {
          toast.success(`${user.name} has been deleted`);
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete user");
        },
      },
    );
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete this user?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground">{user.email}</div>
            <div className="mt-1 text-xs">
              Status:{" "}
              <span className="font-medium">
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm font-medium text-destructive">
              ⚠️ Warning: This action cannot be undone
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The user and all associated data will be permanently removed from
              the system.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteUser.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
