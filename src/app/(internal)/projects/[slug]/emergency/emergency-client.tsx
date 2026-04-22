"use client";

import { IconArrowLeft, IconLoader2, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { FundDialog } from "~/components/emergency/fund-dialog";
import { FundOverview } from "~/components/emergency/fund-overview";
import { TransactionList } from "~/components/emergency/transaction-list";
import { WithdrawDialog } from "~/components/emergency/withdraw-dialog";
import { PageLayout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { useProjectBySlug } from "~/hooks";
import { useUserRole } from "~/hooks/use-user-role";
import { useSession } from "~/stores/use-session-store";

interface EmergencyClientProps {
  projectSlug: string;
}
export function EmergencyClient({ projectSlug }: EmergencyClientProps) {
  const {
    data: project,
    isLoading: isProjectLoading,
    error,
  } = useProjectBySlug(projectSlug);
  const { user } = useSession();
  const { isAdmin } = useUserRole();

  const [isFundOpen, setIsFundOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  if (isProjectLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <PageLayout title="Dana Darurat">
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold">Proyek tidak ditemukan</h2>
          <p className="text-muted-foreground">
            Proyek yang Anda cari tidak ada.
          </p>
          <Button asChild variant="outline">
            <Link href="/projects">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Proyek
            </Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Determine permissions based on project membership
  const projectMember = project.members.find((m) => m.userId === user?.id);
  const memberRole = projectMember?.role;

  const canAddFund = isAdmin || memberRole === "FINANCE";
  const canWithdraw = isAdmin || memberRole === "MANDOR";
  const canReview = isAdmin || memberRole === "FINANCE";

  return (
    <PageLayout
      title={`${project.name} — Dana Darurat`}
      navActions={
        <Button asChild variant="outline" size="sm">
          <Link href={`/projects/${projectSlug}`}>
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="grid gap-6">
          <FundOverview
            projectId={project.id}
            actions={
              <div className="flex gap-2">
                {canWithdraw && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWithdrawOpen(true)}
                  >
                    Tarik Dana
                  </Button>
                )}
                {canAddFund && (
                  <Button size="sm" onClick={() => setIsFundOpen(true)}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Tambah Dana
                  </Button>
                )}
              </div>
            }
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Riwayat Transaksi</h3>
            <TransactionList projectId={project.id} canReview={canReview} />
          </div>
        </div>
      </div>

      <FundDialog
        projectId={project.id}
        open={isFundOpen}
        onOpenChange={setIsFundOpen}
      />

      <WithdrawDialog
        projectId={project.id}
        projectSlug={project.slug}
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
      />
    </PageLayout>
  );
}
