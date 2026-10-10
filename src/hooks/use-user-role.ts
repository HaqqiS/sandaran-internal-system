import { type GlobalRole, ProjectRole } from "@prisma/client";
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

  const isSupervisor = projectRoles.includes(ProjectRole.SUPERVISOR);
  const isArchitect = projectRoles.includes(ProjectRole.ARCHITECT);
  const isFinance = projectRoles.includes(ProjectRole.FINANCE);
  const isLogistic = projectRoles.includes(ProjectRole.LOGISTIC);
  const isExecutive = globalRole === "EXECUTIVE";

  return {
    // Global Roles
    role: globalRole,
    isAdmin: isAdmin(globalRole),
    isExecutive,
    isCEO: isExecutive, // Backward compatibility alias
    isGlobalAdmin: globalRole === "ADMIN",

    // Project Roles
    isSupervisor,
    isMandor: isSupervisor, // Backward compatibility alias
    isArchitect,
    isFinance,
    isLogistic,

    // State
    isLoading: isLoading,
    isAuthenticated: !!user,
    isAuthorized: isAuthorizedRole(globalRole),
  };
}
