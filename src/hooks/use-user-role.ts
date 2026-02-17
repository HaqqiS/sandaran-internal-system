import { type GlobalRole, ProjectRole } from "generated/prisma";
import { isAdmin, isAuthorizedRole } from "~/lib/auth-guards";
import { useSession } from "~/stores/use-session-store";
import { api } from "~/trpc/react";

export function useUserRole() {
  const { user, role } = useSession();
  const globalRole = role as GlobalRole;

  // Fetch projects to determine project-specific roles
  const { data: projects, isLoading } = api.project.getAll.useQuery(undefined, {
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Calculate project roles
  // We check if the user has a specific role in ANY active project
  const projectRoles =
    projects?.flatMap((project) =>
      project.members
        .filter((member) => member.userId === user?.id)
        .map((member) => member.role),
    ) ?? [];

  const isMandor = projectRoles.includes(ProjectRole.MANDOR);
  const isArchitect = projectRoles.includes(ProjectRole.ARCHITECT);
  const isFinance = projectRoles.includes(ProjectRole.FINANCE);

  return {
    // Global Roles
    role: globalRole,
    isAdmin: isAdmin(globalRole),
    isCEO: globalRole === "CEO",
    isGlobalAdmin: globalRole === "ADMIN",

    // Project Roles
    isMandor,
    isArchitect,
    isFinance,

    // State
    isLoading: isLoading,
    isAuthenticated: !!user,
    isAuthorized: isAuthorizedRole(globalRole),
  };
}
