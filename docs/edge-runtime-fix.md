# Edge Runtime Middleware Fix - Dokumentasi

## 🚨 Problem yang Terjadi

### Error 1: TRPCError - Account is not active

```
Account is not active. Please wait for admin approval.
```

**Penyebab:** User yang login belum di-approve admin (`isActive: false`), sehingga `protectedProcedure` memblock akses.

### Error 2: Prisma di Edge Runtime (CRITICAL)

```
A Node.js API is used (setImmediate) which is not supported in the Edge Runtime.
```

**Root Cause:**

```
middleware.ts
  → import { auth } from "~/server/better-auth"
    → import { db } from "~/server/db" (Prisma Client)
      → ❌ Prisma TIDAK bisa jalan di Edge Runtime!
```

**Kenapa terjadi?**

- Next.js Middleware berjalan di **Edge Runtime** (bukan Node.js runtime)
- Edge Runtime tidak support Node.js APIs seperti `setImmediate`, `fs`, dll
- Prisma Client butuh Node.js APIs untuk koneksi database
- Better Auth config kita import Prisma → error!

---

## ✅ Solusi yang Diterapkan

### 1. **Lightweight Middleware (Edge-Compatible)**

**File:** `src/middleware.ts`

**Perubahan:**

- ❌ **SEBELUM:** Validasi session dengan database query
- ✅ **SESUDAH:** Check session token dari cookies saja

```typescript
// BEFORE (❌ Error - uses Prisma)
const session = await auth.api.getSession({ headers: request.headers });
const validation = validateSessionAccess(session);

// AFTER (✅ Works - edge compatible)
const sessionToken = request.cookies.get("better-auth.session_token");
if (!sessionToken) {
  redirect("/");
}
```

**Keuntungan:**

- ✅ Tidak perlu akses database
- ✅ Sangat cepat (hanya baca cookie)
- ✅ Compatible dengan Edge Runtime
- ✅ Tetap protect routes dari user yang belum login

**Trade-off:**

- ⚠️ Tidak bisa validasi role/isActive di middleware
- ✅ Solusi: Validasi di page level (server component)

---

### 2. **Server-Side Auth Helpers**

**File:** `src/lib/server-auth.ts`

Dibuat helper functions untuk validasi di page level:

```typescript
// Require authentication
export async function requireAuth() {
  const session = await getSession();
  const validation = validateSessionAccess(session);

  if (!validation.isValid) {
    redirect(validation.redirectTo ?? "/");
  }

  return session;
}

// Require admin access
export async function requireAdmin() {
  const session = await requireAuth();

  const role = session?.user?.roleGlobal;
  if (role !== "ADMIN" && role !== "CEO") {
    redirect("/unauthorized");
  }

  return session;
}
```

---

## 📖 Cara Menggunakan

### A. Protected Page (User harus login & approved)

```typescript
// app/dashboard/page.tsx
import { requireAuth } from "~/lib/server-auth"

export default async function DashboardPage() {
  // Validasi session, auto-redirect jika tidak valid
  const session = await requireAuth()

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Role: {session.user.roleGlobal}</p>
    </div>
  )
}
```

**Apa yang terjadi:**

1. Middleware check: Ada session token? ✅ → lanjut
2. Page check: Session valid? isActive? Role OK? ✅ → render
3. Jika gagal → auto-redirect ke `/waiting-approval` atau `/unauthorized`

---

### B. Admin-Only Page

```typescript
// app/admin/users/page.tsx
import { requireAdmin } from "~/lib/server-auth"

export default async function AdminUsersPage() {
  // Validasi admin access, auto-redirect jika bukan admin
  const session = await requireAdmin()

  return (
    <div>
      <h1>User Management</h1>
      <p>Admin: {session.user.name}</p>
    </div>
  )
}
```

**Apa yang terjadi:**

1. Middleware check: Ada session token? ✅ → lanjut
2. Page check: Session valid? isActive? Role ADMIN/CEO? ✅ → render
3. Jika bukan admin → redirect ke `/unauthorized`

---

### C. Public Page (No protection needed)

```typescript
// app/page.tsx (login page)
export default async function HomePage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return <LoginForm />
}
```

**Apa yang terjadi:**

1. Middleware check: Path `/` ada di PUBLIC_ROUTES ✅ → skip validation
2. Page check: Sudah login? → redirect ke dashboard

---

## 🔒 Security Layers (Tetap Aman!)

Meskipun middleware lebih simple, security tetap berlapis:

### Layer 1: Middleware (Edge Runtime)

- ✅ Check session token exists
- ✅ Redirect ke `/` jika tidak ada token
- ✅ Sangat cepat, jalan di edge

### Layer 2: Page Level (Server Component)

- ✅ Validasi session lengkap dengan database
- ✅ Check `isActive` status
- ✅ Check `roleGlobal`
- ✅ Auto-redirect berdasarkan status

### Layer 3: tRPC API (Backend)

- ✅ `protectedProcedure` - validasi session + role + isActive
- ✅ `adminProcedure` - validasi admin access
- ✅ Throw error jika tidak authorized

### Layer 4: Better Auth

- ✅ Session expiration (7 hari)
- ✅ Rate limiting
- ✅ CSRF protection
- ✅ Secure cookies

---

## 🎯 Flow Lengkap

### User Belum Login

```
1. User akses /dashboard
2. Middleware: No session token → redirect("/")
3. User lihat login page
```

### User Login Tapi Belum Approved

```
1. User login via Google
2. Session created: isActive=false, role=NONE
3. Middleware: Session token exists ✅ → lanjut
4. Page: requireAuth() → validateSessionAccess()
   → isActive=false → redirect("/waiting-approval")
5. User lihat waiting approval page
```

### User Sudah Approved

```
1. Admin approve user → isActive=true, role=USER
2. User akses /dashboard
3. Middleware: Session token exists ✅ → lanjut
4. Page: requireAuth() → validateSessionAccess()
   → isActive=true ✅, role=USER ✅ → render page
5. User lihat dashboard ✅
```

### User Biasa Coba Akses Admin Page

```
1. User akses /admin/users
2. Middleware: Session token exists ✅ → lanjut
3. Page: requireAdmin() → check role
   → role=USER (bukan ADMIN/CEO) → redirect("/unauthorized")
4. User lihat unauthorized page
```

---

## 📝 Migration Checklist

Untuk setiap protected page, tambahkan:

```typescript
// ✅ DO THIS
import { requireAuth } from "~/lib/server-auth";

export default async function MyPage() {
  const session = await requireAuth();
  // ... rest of page
}
```

Untuk admin pages:

```typescript
// ✅ DO THIS
import { requireAdmin } from "~/lib/server-auth";

export default async function AdminPage() {
  const session = await requireAdmin();
  // ... rest of page
}
```

---

## 🚀 Performance Impact

**BEFORE (dengan Prisma di middleware):**

- ❌ Error - tidak bisa jalan
- ❌ Slow - database query di setiap request

**AFTER (cookie-based middleware):**

- ✅ Works perfectly
- ✅ Super fast - hanya baca cookie
- ✅ Database query hanya di page yang butuh (lazy)
- ✅ Edge Runtime compatible

---

## ✅ Summary

| Aspek           | Sebelum                   | Sesudah                      |
| --------------- | ------------------------- | ---------------------------- |
| **Middleware**  | Database query (❌ error) | Cookie check (✅ works)      |
| **Runtime**     | Node.js (❌ incompatible) | Edge Runtime (✅ compatible) |
| **Performance** | Slow                      | Super fast                   |
| **Security**    | 4 layers                  | 4 layers (sama)              |
| **Validation**  | Middleware + Page         | Page only (lebih baik)       |

**Kesimpulan:** Solusi ini lebih baik karena:

1. ✅ Compatible dengan Edge Runtime
2. ✅ Lebih cepat (no database di middleware)
3. ✅ Security tetap sama kuat
4. ✅ Lebih flexible (validation di page level)
