# Authentication & Authorization Usage Guide

Panduan lengkap penggunaan sistem autentikasi dan autorisasi di aplikasi ini.

## 📚 Table of Contents

1. [Overview](#-overview)
2. [File Purposes](#-file-purposes)
3. [Usage Examples](#-usage-examples)
4. [Decision Tree](#-decision-tree)
5. [Best Practices](#-best-practices)

---

## 🎯 Overview

Sistem auth terdiri dari 3 file utama dengan tujuan berbeda:

| File               | Type            | Usage                         | Server/Client      |
| ------------------ | --------------- | ----------------------------- | ------------------ |
| `auth-guards.ts`   | Pure Functions  | Validasi role sederhana       | ✅ Server & Client |
| `server-auth.ts`   | Async Functions | Page protection               | ✅ Server only     |
| `use-user-role.ts` | React Hook      | UI logic dengan project roles | ✅ Client only     |

---

## 📁 File Purposes

### 1. `lib/auth-guards.ts`

**Pure utility functions untuk validasi role dan authorization**

```typescript
// Available functions:
isAdmin(role); // Cek ADMIN atau CEO
isAuthorizedRole(role); // Cek role valid (bukan NONE)
isActiveUser(isActive); // Cek user aktif
isApprovedUser(approvedAt); // Cek user sudah approved
validateSessionAccess(session); // Validasi lengkap
```

**Karakteristik:**

- ✅ Pure functions - no side effects
- ✅ Bisa digunakan di server & client
- ✅ Stateless - hanya logic checking
- ✅ Return boolean atau object

### 2. `lib/server-auth.ts`

**Server-side page protection helpers**

```typescript
// Available functions:
requireAuth(); // Basic protection, redirect jika tidak authorized
requireAdmin(); // Admin-only protection, redirect jika bukan admin
```

**Karakteristik:**

- ✅ Async functions
- ✅ Server-only (Next.js App Router)
- ✅ Auto redirect jika gagal validasi
- ✅ Digunakan di Server Components

### 3. `hooks/use-user-role.ts`

**React hook untuk mendapatkan role information**

```typescript
// Returns:
{
  // Global Roles
  (role,
    isAdmin,
    isCEO,
    isGlobalAdmin,
    // Project Roles (computed from API)
    isMandor,
    isArchitect,
    isFinance,
    // States
    isLoading,
    isAuthenticated,
    isAuthorized);
}
```

**Karakteristik:**

- ✅ React Hook
- ✅ Client-only
- ✅ Fetches all projects via tRPC
- ✅ Computes project roles
- ✅ Reactive & auto-update

---

## 💡 Usage Examples

### Example 1: Server Component Page Protection

**Use Case:** Protect halaman dari unauthorized access

**File:** `server-auth.ts`

```typescript
// app/(internal)/projects/page.tsx
import { requireAuth } from "~/lib/server-auth"

export default async function ProjectsPage() {
  // ✅ Validasi session sebelum render
  // Auto redirect ke / jika tidak login
  // Auto redirect ke /waiting-approval jika inactive
  // Auto redirect ke /unauthorized jika role = NONE
  await requireAuth()

  return <ProjectsClient />
}
```

---

### Example 2: Admin-Only Page

**Use Case:** Halaman khusus admin

**File:** `server-auth.ts`

```typescript
// app/(internal)/admin/users/page.tsx
import { requireAdmin } from "~/lib/server-auth"

export default async function AdminUsersPage() {
  // ✅ Hanya ADMIN & CEO yang bisa akses
  // User biasa → redirect ke /unauthorized
  const session = await requireAdmin()

  return <AdminContent session={session} />
}
```

---

### Example 3: Conditional Rendering di Client

**Use Case:** Show/hide tombol berdasarkan role

**File:** `auth-guards.ts`

```typescript
// components/project/project-actions.tsx
"use client"

import { isAdmin } from "~/lib/auth-guards"
import { useSessionStore } from "~/stores/use-session-store"

export function ProjectActions() {
  const session = useSessionStore((state) => state.session)

  // ✅ Simple check untuk conditional rendering
  const canEdit = isAdmin(session?.user?.roleGlobal)

  return (
    <div>
      <Button>View</Button>
      {canEdit && <Button>Edit</Button>}
      {canEdit && <Button>Delete</Button>}
    </div>
  )
}
```

---

### Example 4: tRPC Procedure Authorization

**Use Case:** Protect API endpoint

**File:** `auth-guards.ts`

```typescript
// server/api/routers/project.router.ts
import { isAdmin } from "~/lib/auth-guards";
import { TRPCError } from "@trpc/server";

export const projectRouter = createTRPCRouter({
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ✅ Validasi role sebelum delete
      if (!isAdmin(ctx.session.user.roleGlobal)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete projects",
        });
      }

      return await ctx.db.project.delete({
        where: { id: input.id },
      });
    }),
});
```

---

### Example 5: Dashboard dengan Multiple Roles

**Use Case:** Dashboard yang berbeda per role

**File:** `use-user-role.ts`

```typescript
// app/(internal)/dashboard/page.tsx
"use client"

import { useUserRole } from "~/hooks/use-user-role"
import { AdminView, CEOView, MandorView } from "~/components/dashboard"

export default function DashboardPage() {
  const {
    isAdmin,
    isCEO,
    isMandor,
    isArchitect,
    isFinance,
    isLoading
  } = useUserRole()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  // ✅ Render view berdasarkan role hierarchy
  if (isAdmin) return <AdminView />
  if (isCEO) return <CEOView />
  if (isMandor) return <MandorView />
  if (isArchitect) return <ArchitectView />
  if (isFinance) return <FinanceView />

  return <DefaultView />
}
```

---

### Example 6: Project-Specific Permissions

**Use Case:** Permission berdasarkan role di project tertentu

**File:** `use-user-role.ts` + manual check

```typescript
// app/(internal)/projects/[slug]/emergency/emergency-client.tsx
"use client"

import { useUserRole } from "~/hooks/use-user-role"
import { useSession } from "~/stores/use-session-store"

export function EmergencyClient() {
  const { isAdmin } = useUserRole()  // Global admin
  const { user } = useSession()
  const { data: project } = useProjectBySlug(slug)

  // ✅ Kombinasi global admin + project-specific role
  const projectMember = project?.members.find(m => m.userId === user?.id)
  const memberRole = projectMember?.role

  const canAddFund = isAdmin || memberRole === "FINANCE"
  const canWithdraw = isAdmin || memberRole === "MANDOR"
  const canReview = isAdmin || memberRole === "FINANCE"

  return (
    <PageLayout
      actions={
        <>
          {canWithdraw && <Button>Withdraw</Button>}
          {canAddFund && <Button>Add Funds</Button>}
        </>
      }
    >
      <TransactionList canReview={canReview} />
    </PageLayout>
  )
}
```

---

### Example 7: Middleware Validation (Advanced)

**Use Case:** Validate session di middleware

**File:** `auth-guards.ts`

```typescript
// middleware.ts
import { validateSessionAccess } from "~/lib/auth-guards";
import { getSession } from "~/server/better-auth/server";

export async function middleware(req: NextRequest) {
  const session = await getSession();
  const validation = validateSessionAccess(session);

  if (!validation.isValid) {
    return NextResponse.redirect(
      new URL(validation.redirectTo ?? "/", req.url),
    );
  }

  return NextResponse.next();
}
```

---

### Example 8: Multiple Role Checks

**Use Case:** Complex permission logic

**File:** `auth-guards.ts`

```typescript
// components/project/member-list.tsx
import { isAdmin } from "~/lib/auth-guards"
import { useSession } from "~/stores/use-session-store"

export function MemberList({ project }) {
  const session = useSessionStore((state) => state.session)
  const currentUserId = session?.user?.id

  const isGlobalAdmin = isAdmin(session?.user?.roleGlobal)
  const isProjectOwner = project.ownerId === currentUserId

  // ✅ Complex logic: admin OR owner can manage
  const canManageMembers = isGlobalAdmin || isProjectOwner

  return (
    <div>
      {project.members.map(member => (
        <MemberCard
          key={member.id}
          member={member}
          canEdit={canManageMembers}
          canRemove={canManageMembers && member.userId !== currentUserId}
        />
      ))}
    </div>
  )
}
```

---

## 🌳 Decision Tree

```
┌─────────────────────────────────────────────────┐
│ Apakah di Server Component (page.tsx)?         │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │ YA                │ TIDAK
        ▼                   ▼
┌───────────────────┐  ┌──────────────────────────────┐
│ server-auth.ts    │  │ Apakah butuh Project Roles?  │
│                   │  │ (MANDOR, ARCHITECT, FINANCE) │
│ requireAuth()     │  └────────┬─────────────────────┘
│ requireAdmin()    │           │
└───────────────────┘  ┌────────┴─────────┐
                       │ YA               │ TIDAK
                       ▼                  ▼
              ┌─────────────────┐  ┌─────────────────┐
              │ use-user-role.ts│  │ auth-guards.ts  │
              │                 │  │                 │
              │ useUserRole()   │  │ isAdmin()       │
              │ (React Hook)    │  │ (Pure Function) │
              └─────────────────┘  └─────────────────┘
```

---

## ✅ Best Practices

### 1. **Server Component Protection**

```typescript
// ✅ CORRECT
export default async function Page() {
  await requireAuth()
  return <Content />
}

// ❌ WRONG - Jangan pakai hook di server
export default async function Page() {
  const { isAdmin } = useUserRole() // Error!
}
```

### 2. **Client Component Simple Check**

```typescript
// ✅ CORRECT - Simple check
const canEdit = isAdmin(session?.user?.roleGlobal);

// ❌ OVERKILL - Tidak perlu hook kalau hanya cek isAdmin
const { isAdmin } = useUserRole();
```

### 3. **Client Component with Project Roles**

```typescript
// ✅ CORRECT - Butuh project roles
const { isMandor, isArchitect } = useUserRole();

// ❌ WRONG - Tidak bisa dapat project roles dari auth-guards
const canCreate = isAdmin(role); // Tidak tahu apakah user adalah ARCHITECT
```

### 4. **Don't Mix Concerns**

```typescript
// ✅ CORRECT - Separation of concerns
// Server: requireAuth()
// Client pure check: isAdmin()
// Client with data: useUserRole()

// ❌ WRONG - Jangan mix async di client
const session = await requireAuth(); // Can't use await in Client Component
```

### 5. **Caching & Performance**

```typescript
// ✅ CORRECT - useUserRole sudah handle caching
const { isAdmin } = useUserRole() // Cache 5 minutes

// ❌ WRONG - Multiple calls akan fetch berkali-kali tanpa cache
const projects = await api.project.getAll.query()
const isMandor = projects.some(...)
```

---

## 🎓 Summary

| Scenario                         | Use                            |
| -------------------------------- | ------------------------------ |
| **Protect Server Page**          | `await requireAuth()`          |
| **Admin-Only Server Page**       | `await requireAdmin()`         |
| **Simple Role Check (Client)**   | `isAdmin(role)`                |
| **tRPC Authorization**           | `if (!isAdmin()) throw Error`  |
| **Dashboard Routing**            | `useUserRole()` hook           |
| **Project-Specific Permissions** | `useUserRole() + manual check` |
| **Conditional UI (Simple)**      | `isAdmin()` from auth-guards   |
| **Conditional UI (Complex)**     | `useUserRole()` hook           |

---

## 📚 Related Files

- [Auth Guards Implementation](../src/lib/auth-guards.ts)
- [Server Auth Helpers](../src/lib/server-auth.ts)
- [useUserRole Hook](../src/hooks/use-user-role.ts)
- [Better Auth Configuration](../src/server/better-auth/index.ts)

---

**Last Updated:** 2026-02-11
