import type { ProjectRole } from "@prisma/client";

export interface DummyProjectMember {
  userEmail: string;
  projectSlug: string;
  role: ProjectRole;
}

export const DUMMY_PROJECT_MEMBERS: DummyProjectMember[] = [
  // --- Proyek 1: Sadara Boutique Resort ---
  {
    userEmail: "supervisor@sandaran.id",
    projectSlug: "sadara-boutique-resort",
    role: "SUPERVISOR",
  },
  {
    userEmail: "architect@sandaran.id",
    projectSlug: "sadara-boutique-resort",
    role: "ARCHITECT",
  },
  {
    userEmail: "finance@sandaran.id",
    projectSlug: "sadara-boutique-resort",
    role: "FINANCE",
  },
  {
    userEmail: "logistic@sandaran.id",
    projectSlug: "sadara-boutique-resort",
    role: "LOGISTIC",
  },

  // --- Proyek 2: Sekar Tunjung House ---
  {
    userEmail: "supervisor@sandaran.id",
    projectSlug: "sekar-tunjung-house",
    role: "SUPERVISOR",
  },
  {
    userEmail: "architect@sandaran.id",
    projectSlug: "sekar-tunjung-house",
    role: "ARCHITECT",
  },
  {
    userEmail: "finance@sandaran.id",
    projectSlug: "sekar-tunjung-house",
    role: "FINANCE",
  },
  {
    userEmail: "logistic@sandaran.id",
    projectSlug: "sekar-tunjung-house",
    role: "LOGISTIC",
  },

  // --- Proyek 3: B A House ---
  {
    userEmail: "supervisor@sandaran.id",
    projectSlug: "b-a-house",
    role: "SUPERVISOR",
  },
  {
    userEmail: "finance@sandaran.id",
    projectSlug: "b-a-house",
    role: "FINANCE",
  },

  // --- Proyek 4: Villa Jimbaran ---
  {
    userEmail: "architect@sandaran.id",
    projectSlug: "villa-jimbaran",
    role: "ARCHITECT",
  },
  {
    userEmail: "finance@sandaran.id",
    projectSlug: "villa-jimbaran",
    role: "FINANCE",
  },
];
