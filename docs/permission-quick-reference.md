# 🚀 Permission Guard Quick Reference

> **Developer Cheat Sheet for tRPC Permission Implementation**

---

## 📌 Quick Decision Tree

```
┌─ Need authentication?
│  ├─ NO  → Use publicProcedure
│  └─ YES → Continue ↓
│
├─ Admin/CEO only?
│  ├─ YES → Use adminProcedure
│  └─ NO  → Continue ↓
│
├─ Needs project context?
│  ├─ NO  → Use protectedProcedure
│  └─ YES → Continue ↓
│
├─ Which project roles allowed?
│  ├─ MANDOR only       → Use projectProcedure(['MANDOR'])
│  ├─ FINANCE only      → Use projectProcedure(['FINANCE'])
│  ├─ MANDOR + FINANCE  → Use projectProcedure(['MANDOR', 'FINANCE'])
│  └─ All project roles → Use projectProcedure(['MANDOR', 'ARCHITECT', 'FINANCE'])
│
└─ Needs ownership check?
   ├─ NO  → Done
   └─ YES → Add ownership guard in mutation
```

---

## 🔧 Available Procedures (Current + Future)

### ✅ Already Implemented

| Procedure            | When to Use            | Example                    |
| -------------------- | ---------------------- | -------------------------- |
| `publicProcedure`    | No auth needed         | Health check, public info  |
| `protectedProcedure` | Any authenticated user | User profile, settings     |
| `adminProcedure`     | ADMIN or CEO only      | User management, approvals |

### 🔜 To Be Implemented

| Procedure          | When to Use                       | Example                       |
| ------------------ | --------------------------------- | ----------------------------- |
| `projectProcedure` | Project member with specific role | Daily reports, emergency fund |

---

## 📝 Code Examples

### Example 1: Public Endpoint (No Auth)

```typescript
// src/server/api/routers/health.router.ts
export const healthRouter = createTRPCRouter({
  check: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date() };
  }),
});
```

---

### Example 2: Protected Endpoint (Any Authenticated User)

```typescript
// src/server/api/routers/user.router.ts
export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(({ ctx }) => {
    // ctx.session.user is guaranteed to exist
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    });
  }),
});
```

---

### Example 3: Admin-Only Endpoint

```typescript
// src/server/api/routers/admin.router.ts
export const adminRouter = createTRPCRouter({
  approveUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only ADMIN or CEO can reach here
      return ctx.db.user.update({
        where: { id: input.userId },
        data: {
          isActive: true,
          approvedAt: new Date(),
          approvedById: ctx.session.user.id,
        },
      });
    }),
});
```

---

### Example 4: Project-Scoped Endpoint (To Be Implemented)

```typescript
// src/server/api/routers/report.router.ts
export const reportRouter = createTRPCRouter({
  create: projectProcedure(["MANDOR", "ARCHITECT"])
    .input(
      z.object({
        projectId: z.string(),
        taskDescription: z.string(),
        // ... other fields
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // At this point:
      // 1. User is authenticated
      // 2. User is active
      // 3. User is member of input.projectId
      // 4. User has role MANDOR or ARCHITECT in that project

      return ctx.db.dailyReport.create({
        data: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
          taskDescription: input.taskDescription,
          // ...
        },
      });
    }),
});
```

---

### Example 5: Ownership Check Pattern

```typescript
// src/server/api/routers/report.router.ts
export const reportRouter = createTRPCRouter({
  update: projectProcedure(["MANDOR", "ARCHITECT"])
    .input(
      z.object({
        reportId: z.string(),
        taskDescription: z.string(),
        // ...
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Step 1: Fetch the report
      const report = await ctx.db.dailyReport.findUnique({
        where: { id: input.reportId },
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      // Step 2: Ownership check (ADMIN bypasses)
      if (ctx.session.user.roleGlobal !== "ADMIN") {
        if (report.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Can only edit own reports",
          });
        }
      }

      // Step 3: Perform update
      return ctx.db.dailyReport.update({
        where: { id: input.reportId },
        data: { taskDescription: input.taskDescription },
      });
    }),
});
```

---

### Example 6: CEO Read-Only Enforcement

```typescript
// src/server/api/routers/emergency.router.ts
export const emergencyRouter = createTRPCRouter({
  verify: projectProcedure(["FINANCE"])
    .input(
      z.object({
        transactionId: z.string(),
        status: z.enum(["APPROVED", "REJECTED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // CEO cannot reach here (blocked by projectProcedure)
      // Only FINANCE role can verify

      return ctx.db.emergencyTransaction.update({
        where: { id: input.transactionId },
        data: {
          status: input.status,
          verifiedById: ctx.session.user.id,
          verifiedAt: new Date(),
        },
      });
    }),
});
```

---

## 🛡️ Guard Helper Functions (To Be Created)

### Helper 1: Get Project Role

```typescript
// src/server/api/helpers/permission.ts
export async function getProjectRole(
  db: PrismaClient,
  userId: string,
  projectId: string,
): Promise<ProjectRole | null> {
  const member = await db.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
  });

  return member?.role ?? null;
}
```

---

### Helper 2: Check Project Membership

```typescript
// src/server/api/helpers/permission.ts
export async function requireProjectMembership(
  db: PrismaClient,
  userId: string,
  projectId: string,
): Promise<ProjectRole> {
  const role = await getProjectRole(db, userId, projectId);

  if (!role) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this project",
    });
  }

  return role;
}
```

---

### Helper 3: Check Project Role Permission

```typescript
// src/server/api/helpers/permission.ts
export async function requireProjectRole(
  db: PrismaClient,
  userId: string,
  projectId: string,
  allowedRoles: ProjectRole[],
): Promise<ProjectRole> {
  const role = await requireProjectMembership(db, userId, projectId);

  if (!allowedRoles.includes(role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `This action requires one of: ${allowedRoles.join(", ")}`,
    });
  }

  return role;
}
```

---

### Helper 4: Check Ownership

```typescript
// src/server/api/helpers/permission.ts
export function requireOwnership(
  entity: { userId: string },
  currentUserId: string,
  globalRole: GlobalRole,
): void {
  // ADMIN bypasses ownership check
  if (globalRole === "ADMIN") {
    return;
  }

  if (entity.userId !== currentUserId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You can only modify your own resources",
    });
  }
}
```

---

## 🎯 Common Patterns

### Pattern 1: CRUD with Role-Based Access

```typescript
export const itemRouter = createTRPCRouter({
  // Anyone in project can read
  list: projectProcedure(["MANDOR", "ARCHITECT", "FINANCE"])
    .input(z.object({ projectId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.logisticItem.findMany({
        where: { projectId: input.projectId },
      });
    }),

  // Only FINANCE can create
  create: projectProcedure(["FINANCE"])
    .input(
      z.object({
        projectId: z.string(),
        name: z.string(),
        unit: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.logisticItem.create({
        data: input,
      });
    }),
});
```

---

### Pattern 2: Conditional Logic Based on Role

```typescript
export const reportRouter = createTRPCRouter({
  delete: projectProcedure(["MANDOR", "ARCHITECT"])
    .input(z.object({ reportId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.dailyReport.findUniqueOrThrow({
        where: { id: input.reportId },
      });

      // Get user's role in this project
      const projectRole = await getProjectRole(
        ctx.db,
        ctx.session.user.id,
        report.projectId,
      );

      // ADMIN can delete any report
      if (ctx.session.user.roleGlobal === "ADMIN") {
        return ctx.db.dailyReport.delete({
          where: { id: input.reportId },
        });
      }

      // Others can only delete own reports
      requireOwnership(
        report,
        ctx.session.user.id,
        ctx.session.user.roleGlobal,
      );

      return ctx.db.dailyReport.delete({
        where: { id: input.reportId },
      });
    }),
});
```

---

### Pattern 3: Multi-Step Verification

```typescript
export const emergencyRouter = createTRPCRouter({
  request: projectProcedure(["MANDOR"])
    .input(
      z.object({
        projectId: z.string(),
        amount: z.number(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Step 1: Verify emergency fund exists
      const fund = await ctx.db.emergencyFund.findUnique({
        where: { projectId: input.projectId },
      });

      if (!fund) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Emergency fund not set up for this project",
        });
      }

      // Step 2: Create transaction
      return ctx.db.emergencyTransaction.create({
        data: {
          fundId: fund.id,
          requestedById: ctx.session.user.id,
          amount: input.amount,
          description: input.description,
          status: "PENDING",
        },
      });
    }),
});
```

---

## 🚨 Error Handling Checklist

When implementing guards, always handle:

- [ ] **Invalid projectId** → `NOT_FOUND`
- [ ] **User not in project** → `FORBIDDEN` ("Not a member")
- [ ] **Wrong project role** → `FORBIDDEN` ("Insufficient permissions")
- [ ] **Ownership violation** → `FORBIDDEN` ("Can only edit own")
- [ ] **CEO mutation attempt** → `FORBIDDEN` ("CEO has read-only access")
- [ ] **Missing related entity** → `NOT_FOUND` (e.g., emergency fund)

---

## 🔍 Debugging Tips

### Check Current User Context

```typescript
.mutation(({ ctx }) => {
  console.log("User ID:", ctx.session.user.id);
  console.log("Global Role:", ctx.session.user.roleGlobal);
  console.log("Is Active:", ctx.session.user.isActive);
  // ...
});
```

### Check Project Role

```typescript
.mutation(async ({ ctx, input }) => {
  const role = await getProjectRole(
    ctx.db,
    ctx.session.user.id,
    input.projectId
  );
  console.log("Project Role:", role);
  // ...
});
```

### Verify Ownership

```typescript
.mutation(async ({ ctx, input }) => {
  const entity = await ctx.db.dailyReport.findUnique({
    where: { id: input.reportId },
  });
  console.log("Entity Owner:", entity?.userId);
  console.log("Current User:", ctx.session.user.id);
  console.log("Match:", entity?.userId === ctx.session.user.id);
  // ...
});
```

---

## 📚 Related Documents

- [Permission Matrix](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-matrix.md) - Complete permission table
- [Permission Flows](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-flows.md) - Visual diagrams

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-02
