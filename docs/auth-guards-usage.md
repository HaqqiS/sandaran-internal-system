# Contoh Penggunaan Auth Guards

## 📚 Fungsi-fungsi di `auth-guards.ts`

### 1. `isAuthorizedRole(role)`

**Kegunaan:** Check apakah role user adalah role yang diizinkan (ADMIN, CEO, atau USER)

**Contoh Penggunaan:**

```typescript
import { isAuthorizedRole } from "~/lib/auth-guards"

// Di Server Component
const session = await getSession()
const role = session?.user?.roleGlobal

if (isAuthorizedRole(role)) {
  console.log("User memiliki akses ke sistem")
} else {
  console.log("User tidak memiliki akses (role: NONE)")
}

// Contoh dalam conditional rendering
{isAuthorizedRole(session?.user?.roleGlobal) && (
  <div>Konten untuk user yang authorized</div>
)}
```

---

### 2. `isActiveUser(isActive)`

**Kegunaan:** Check apakah user sudah di-approve oleh admin (isActive = true)

**Contoh Penggunaan:**

```typescript
import { isActiveUser } from "~/lib/auth-guards"

const session = await getSession()
const active = session?.user?.isActive

if (isActiveUser(active)) {
  console.log("User sudah di-approve admin")
} else {
  console.log("User masih menunggu approval")
  redirect("/waiting-approval")
}

// Contoh di component
{isActiveUser(session?.user?.isActive) ? (
  <Badge>Active</Badge>
) : (
  <Badge variant="warning">Pending Approval</Badge>
)}
```

---

### 3. `isApprovedUser(approvedAt)`

**Kegunaan:** Check apakah user pernah di-approve (memiliki timestamp approvedAt)

**Contoh Penggunaan:**

```typescript
import { isApprovedUser } from "~/lib/auth-guards"

const user = await db.user.findUnique({ where: { id: userId } })

if (isApprovedUser(user.approvedAt)) {
  console.log(`User di-approve pada: ${user.approvedAt}`)
  console.log(`Di-approve oleh: ${user.approvedBy?.name}`)
} else {
  console.log("User belum pernah di-approve")
}

// Contoh untuk menampilkan info approval
{isApprovedUser(user.approvedAt) && (
  <div>
    <p>Approved on: {user.approvedAt.toLocaleDateString()}</p>
    <p>Approved by: {user.approvedBy?.name}</p>
  </div>
)}
```

---

### 4. `isAdmin(role)`

**Kegunaan:** Check apakah user adalah admin (role ADMIN atau CEO)

**Contoh Penggunaan:**

```typescript
import { isAdmin } from "~/lib/auth-guards"

const session = await getSession()
const role = session?.user?.roleGlobal

if (isAdmin(role)) {
  console.log("User adalah admin, bisa akses admin panel")
} else {
  console.log("User bukan admin")
  redirect("/unauthorized")
}

// Contoh conditional rendering untuk admin menu
{isAdmin(session?.user?.roleGlobal) && (
  <nav>
    <Link href="/admin/users">Manage Users</Link>
    <Link href="/admin/settings">Settings</Link>
  </nav>
)}

// Contoh di Server Action
async function deleteProject(projectId: string) {
  "use server"
  const session = await getSession()

  if (!isAdmin(session?.user?.roleGlobal)) {
    throw new Error("Admin access required")
  }

  await db.project.delete({ where: { id: projectId } })
}
```

---

### 5. `validateSessionAccess(session)`

**Kegunaan:** Validasi lengkap session dan return alasan jika tidak valid

**Contoh Penggunaan:**

```typescript
import { validateSessionAccess } from "~/lib/auth-guards"

// Di Middleware (sudah digunakan)
const session = await auth.api.getSession({ headers: request.headers })
const validation = validateSessionAccess(session)

if (!validation.isValid) {
  console.log(`Access denied: ${validation.reason}`)
  const redirectUrl = new URL(validation.redirectTo ?? "/", request.url)
  return NextResponse.redirect(redirectUrl)
}

// Di Server Component untuk custom logic
const session = await getSession()
const validation = validateSessionAccess(session)

switch (validation.reason) {
  case "no_session":
    return <LoginPrompt />
  case "inactive":
    return <WaitingApprovalMessage />
  case "unauthorized_role":
    return <UnauthorizedMessage />
  default:
    return <DashboardContent />
}

// Contoh untuk API route protection
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  const validation = validateSessionAccess(session)

  if (!validation.isValid) {
    return Response.json(
      { error: validation.reason },
      { status: 401 }
    )
  }

  // Process request...
}
```

---

### 6. `ALLOWED_ROLES` & `ADMIN_ROLES`

**Kegunaan:** Konstanta array untuk role validation

**Contoh Penggunaan:**

```typescript
import { ALLOWED_ROLES, ADMIN_ROLES } from "~/lib/auth-guards"

// Check if role is in allowed list
const role = session?.user?.roleGlobal
if (role && ALLOWED_ROLES.includes(role)) {
  console.log("Role is allowed")
}

// Check if role is admin
if (role && ADMIN_ROLES.includes(role)) {
  console.log("User is admin")
}

// Contoh untuk dropdown/select
<select name="role">
  {ALLOWED_ROLES.map(role => (
    <option key={role} value={role}>{role}</option>
  ))}
</select>

// Contoh untuk validation
function assignRole(userId: string, role: string) {
  if (!ALLOWED_ROLES.includes(role as GlobalRole)) {
    throw new Error("Invalid role")
  }
  // Assign role...
}
```

---

## 🎯 Use Cases Lengkap

### Use Case 1: Protected Page

```typescript
// app/dashboard/page.tsx
import { getSession } from "~/server/better-auth/server"
import { validateSessionAccess } from "~/lib/auth-guards"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getSession()
  const validation = validateSessionAccess(session)

  if (!validation.isValid) {
    redirect(validation.redirectTo ?? "/")
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Your role: {session.user.roleGlobal}</p>
    </div>
  )
}
```

### Use Case 2: Admin-Only Page

```typescript
// app/admin/page.tsx
import { getSession } from "~/server/better-auth/server"
import { isAdmin } from "~/lib/auth-guards"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await getSession()

  if (!isAdmin(session?.user?.roleGlobal)) {
    redirect("/unauthorized")
  }

  return <AdminDashboard />
}
```

### Use Case 3: Conditional UI

```typescript
// components/navbar.tsx
"use client"
import { useSession } from "~/hooks/useSession"
import { isAdmin, isAuthorizedRole } from "~/lib/auth-guards"

export function Navbar() {
  const { session } = useSession()
  const role = session?.user?.roleGlobal

  return (
    <nav>
      <Link href="/">Home</Link>

      {isAuthorizedRole(role) && (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/projects">Projects</Link>
        </>
      )}

      {isAdmin(role) && (
        <Link href="/admin">Admin Panel</Link>
      )}
    </nav>
  )
}
```

### Use Case 4: Server Action Protection

```typescript
// app/actions.ts
"use server";
import { getSession } from "~/server/better-auth/server";
import { isAdmin, isActiveUser } from "~/lib/auth-guards";

export async function deleteUser(userId: string) {
  const session = await getSession();

  // Check if user is admin
  if (!isAdmin(session?.user?.roleGlobal)) {
    throw new Error("Admin access required");
  }

  // Check if user is active
  if (!isActiveUser(session?.user?.isActive)) {
    throw new Error("Your account is not active");
  }

  await db.user.delete({ where: { id: userId } });
  return { success: true };
}
```

---
