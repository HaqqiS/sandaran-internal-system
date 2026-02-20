"use client";

import { IconArrowLeft, IconLoader2, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { PageLayout } from "~/components/layout";
import { LogisticItemDialog } from "~/components/logistic/item-dialog";
import { ItemList } from "~/components/logistic/item-list";
import { Button } from "~/components/ui/button";
import { useProjectBySlug, useProjectMembers } from "~/hooks/useProject";
import { useSession } from "~/stores/use-session-store";

interface LogisticsClientProps {
  projectSlug: string;
}

export function LogisticsClient({ projectSlug }: LogisticsClientProps) {
  const { data: project, isLoading, error } = useProjectBySlug(projectSlug);
  // useProjectBySlug might not return error based on previous view, but we can handle !project as error if not loading
  const { data: members } = useProjectMembers(project?.id ?? "");

  const { session } = useSession();
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Find user's role
  const projectMember = members?.find((m) => m.userId === session?.user?.id);
  const role = projectMember?.role;

  const canManage = role === "FINANCE" || session?.user?.roleGlobal === "ADMIN";

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <PageLayout title="Logistics & Inventory">
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold">Project not found</h2>
          <p className="text-muted-foreground">
            The project you are looking for does not exist.
          </p>
          <Button asChild variant="outline">
            <Link href="/projects">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${project.name} - Logistics & Inventory`}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${projectSlug}`}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          {canManage && (
            <LogisticItemDialog
              projectId={project.id}
              open={showAddDialog}
              onOpenChange={setShowAddDialog}
              onSuccess={() => setShowAddDialog(false)}
            >
              <Button>
                <IconPlus className="mr-2 size-4" />
                Add Item
              </Button>
            </LogisticItemDialog>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Manage material stock and track usage.
          </p>
        </div>

        <ItemList projectId={project.id} />
      </div>
    </PageLayout>
  );
}
