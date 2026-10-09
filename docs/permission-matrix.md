# 🛡️ Permission Matrix — Sandaran Internal System

> **Dokumen Final: Action-Based Permission System**
>
> Sistem ini menggunakan **3-Layer Permission Guard**:
>
> 1. Authentication Guard (✅ sudah ada)
> 2. Global Role Guard (✅ sudah ada)
> 3. Project Context Guard (🔜 akan dibuat)

---

## 📋 Table of Contents

1. [Permission Vocabulary](#permission-vocabulary)
2. [Role Definitions](#role-definitions)
3. [Complete Permission Matrix](#complete-permission-matrix)
4. [Special Rules & Edge Cases](#special-rules--edge-cases)
5. [Implementation Checklist](#implementation-checklist)

---

## 1️⃣ Permission Vocabulary

### Global Actions (No Project Context)

| Action Code         | Description                              | Layer   |
| ------------------- | ---------------------------------------- | ------- |
| `SYSTEM_ACCESS`     | Access to the system after login         | Layer 1 |
| `USER_MANAGEMENT`   | CRUD users, approve/reject registrations | Layer 2 |
| `MASTER_DATA_CRUD`  | Create/edit/delete master data           | Layer 2 |
| `ALL_PROJECTS_READ` | Read all projects (CEO only)             | Layer 2 |

### Project-Scoped Actions (Requires Project Context)

| Action Code                   | Description                           | Affected Entities                 |
| ----------------------------- | ------------------------------------- | --------------------------------- |
| `PROJECT_READ`                | View project details                  | Project                           |
| `PROJECT_ADMIN`               | Edit project settings, manage members | Project, ProjectMember            |
| `REPORT_CREATE`               | Create daily report                   | DailyReport                       |
| `REPORT_EDIT_OWN`             | Edit own daily report                 | DailyReport                       |
| `REPORT_EDIT_ANY`             | Edit any daily report in project      | DailyReport                       |
| `REPORT_DELETE_OWN`           | Delete own daily report               | DailyReport                       |
| `REPORT_DELETE_ANY`           | Delete any daily report               | DailyReport                       |
| `REPORT_MEDIA_UPLOAD`         | Upload media to report                | ReportMedia                       |
| `REPORT_TASK_CREATE`          | Add task breakdown to report          | DailyReportTask                   |
| `REPORT_TASK_EDIT_OWN`        | Edit task in own report               | DailyReportTask                   |
| `EMERGENCY_REQUEST`           | Request emergency fund                | EmergencyTransaction              |
| `EMERGENCY_VERIFY`            | Verify/approve emergency fund request | EmergencyTransaction              |
| `EMERGENCY_BALANCE_ADD`       | Add balance to emergency fund         | EmergencyFund                     |
| `LOGISTIC_READ`               | View logistic items and transactions  | LogisticItem, LogisticTransaction |
| `LOGISTIC_CREATE_ITEM`        | Create new logistic item              | LogisticItem                      |
| `LOGISTIC_REQUEST`            | Request logistic IN/OUT               | LogisticTransaction               |
| `LOGISTIC_CONFIRM`            | Confirm logistic delivery/usage       | LogisticTransaction               |
| `LOGISTIC_APPROVE`            | Approve logistic transaction          | LogisticTransaction               |
| `PROJECT_DOCUMENT_UPLOAD`     | Upload project documents/files        | ProjectDocument                   |
| `PROJECT_DOCUMENT_EDIT_OWN`   | Edit own project documents            | ProjectDocument                   |
| `PROJECT_DOCUMENT_DELETE_OWN` | Delete own project documents          | ProjectDocument                   |
| `PROJECT_DOCUMENT_READ`       | View project documents                | ProjectDocument                   |
| `REPORT_COMMENT_CREATE`       | Add comment to daily report           | ReportComment (optional)          |
| `PROFILE_EDIT_OWN`            | Edit own user profile                 | User                              |

---

## 2️⃣ Role Definitions

### Global Roles (from `GlobalRole` enum)

| Role      | Code    | Description          | System-Wide Privileges                             |
| --------- | ------- | -------------------- | -------------------------------------------------- |
| **Admin** | `ADMIN` | System administrator | Full access to all features, all projects          |
| **CEO**   | `CEO`   | Company executive    | **Read-only** access to all projects, no mutations |
| **User**  | `USER`  | Regular user         | Access based on project role assignment            |
| **None**  | `NONE`  | Unassigned/pending   | No access (blocked by Layer 1)                     |

### Project Roles (from `ProjectRole` enum)

| Role          | Code        | Description       | Primary Responsibilities                                         |
| ------------- | ----------- | ----------------- | ---------------------------------------------------------------- |
| **Mandor**    | `MANDOR`    | Site supervisor   | Daily reports, emergency requests, record field logistics in/out |
| **Architect** | `ARCHITECT` | Project architect | Daily reports, project documents, design files                   |
| **Finance**   | `FINANCE`   | Financial officer | Emergency fund verification, budget monitoring, logistics read   |
| **Logistic**  | `LOGISTIC`  | Logistics officer | Master items CRUD, stock management, transaction in/out          |

---

## 3️⃣ Complete Permission Matrix

### 🔹 Matrix Legend

| Symbol | Meaning                        |
| ------ | ------------------------------ |
| ✅     | Full access                    |
| 🟢     | Conditional access (see notes) |
| ⚠️     | Limited access (see notes)     |
| ❌     | No access                      |
| 📖     | Read-only                      |

---

### 🔹 Global Actions (No Project Context Required)

| Action              | ADMIN | CEO | USER | Notes                                                      |
| ------------------- | ----- | --- | ---- | ---------------------------------------------------------- |
| `SYSTEM_ACCESS`     | ✅    | ✅  | ✅   | All active users with role ≠ NONE                          |
| `USER_MANAGEMENT`   | ✅    | ❌  | ❌   | ADMIN only                                                 |
| `MASTER_DATA_CRUD`  | ✅    | ❌  | ❌   | ADMIN only                                                 |
| `ALL_PROJECTS_READ` | ✅    | 📖  | ❌   | CEO can read all projects                                  |
| `PROFILE_EDIT_OWN`  | ✅    | ✅  | ✅   | All users can edit own profile (CEO exception to mutation) |

---

### 🔹 Project-Scoped Actions

#### A. Project Management

| Action          | ADMIN | CEO | MANDOR | ARCHITECT | FINANCE | LOGISTIC | Notes               |
| --------------- | ----- | --- | ------ | --------- | ------- | -------- | ------------------- |
| `PROJECT_READ`  | ✅    | 📖  | ✅     | ✅        | ✅      | ✅       | All project members |
| `PROJECT_ADMIN` | ✅    | ❌  | ❌     | ❌        | ❌      | ❌       | ADMIN only          |

---

#### B. Daily Reports

| Action                  | ADMIN | CEO | MANDOR | ARCHITECT | FINANCE | LOGISTIC | Notes                                 |
| ----------------------- | ----- | --- | ------ | --------- | ------- | -------- | ------------------------------------- |
| `REPORT_CREATE`         | ✅    | ❌  | ✅     | ✅        | ❌      | ❌       | Field workers only                    |
| `REPORT_EDIT_OWN`       | ✅    | ❌  | 🟢     | 🟢        | ❌      | ❌       | Own reports only (ownership check)    |
| `REPORT_EDIT_ANY`       | ✅    | ❌  | ❌     | ❌        | ❌      | ❌       | ADMIN only                            |
| `REPORT_DELETE_OWN`     | ✅    | ❌  | 🟢     | 🟢        | ❌      | ❌       | Own reports only (ownership check)    |
| `REPORT_DELETE_ANY`     | ✅    | ❌  | ❌     | ❌        | ❌      | ❌       | ADMIN only                            |
| `REPORT_MEDIA_UPLOAD`   | ✅    | ❌  | 🟢     | 🟢        | ❌      | ❌       | Only to own reports (ownership check) |
| `REPORT_TASK_CREATE`    | ✅    | ❌  | 🟢     | 🟢        | ❌      | ❌       | Add task breakdown to own report      |
| `REPORT_TASK_EDIT_OWN`  | ✅    | ❌  | 🟢     | 🟢        | ❌      | ❌       | Edit tasks in own report              |
| `REPORT_COMMENT_CREATE` | ✅    | ✅  | ✅     | ✅        | ✅      | ✅       | All members & CEO can comment         |

**🟢 Conditional Rules:**

- MANDOR/ARCHITECT can edit/delete **only their own reports**
- Ownership verified via `DailyReport.userId === ctx.session.user.id`
- CEO can **comment** on reports (monitoring exception)

---

#### C. Emergency Fund

| Action                  | ADMIN | CEO | MANDOR | ARCHITECT | FINANCE | LOGISTIC | Notes                             |
| ----------------------- | ----- | --- | ------ | --------- | ------- | -------- | --------------------------------- |
| `EMERGENCY_REQUEST`     | ✅    | ❌  | ✅     | ❌        | ❌      | ❌       | MANDOR requests, FINANCE verifies |
| `EMERGENCY_VERIFY`      | ✅    | ❌  | ❌     | ❌        | ✅      | ❌       | FINANCE approves/rejects          |
| `EMERGENCY_BALANCE_ADD` | ✅    | ❌  | ❌     | ❌        | ✅      | ❌       | FINANCE adds initial balance      |

**Flow:**

1. MANDOR creates `EmergencyTransaction` (status: PENDING)
2. FINANCE verifies → status: APPROVED/REJECTED
3. Only FINANCE can add balance to `EmergencyFund`
4. LOGISTIC has read-only access to balance for transparency

---

#### D. Logistics

| Action                 | ADMIN | CEO | MANDOR | ARCHITECT | FINANCE | LOGISTIC | Notes                                  |
| ---------------------- | ----- | --- | ------ | --------- | ------- | -------- | -------------------------------------- |
| `LOGISTIC_READ`        | ✅    | 📖  | ✅     | 📖        | 📖      | ✅       | All can view                           |
| `LOGISTIC_CREATE_ITEM` | ✅    | ❌  | ❌     | ❌        | ❌      | ✅       | LOGISTIC manages master items          |
| `LOGISTIC_REQUEST`     | ✅    | ❌  | ✅     | ❌        | ❌      | ✅       | MANDOR & LOGISTIC record transactions  |
| `LOGISTIC_CONFIRM`     | ✅    | ❌  | ✅     | ❌        | ❌      | ✅       | MANDOR & LOGISTIC confirm in/out       |
| `LOGISTIC_APPROVE`     | ✅    | ❌  | ❌     | ❌        | ❌      | ✅       | LOGISTIC handles item approval/status  |

**Flow:**

1. LOGISTIC manages master data items (create/edit/delete)
2. MANDOR & LOGISTIC record transactions masuk (`IN`) dan keluar (`OUT`)
3. FINANCE & ARCHITECT memiliki akses read-only untuk monitoring anggaran & spesifikasi
4. ADMIN retains full bypass access

---

#### E. Project Documents

| Action                        | ADMIN | CEO | MANDOR | ARCHITECT | FINANCE | LOGISTIC | Notes                              |
| ----------------------------- | ----- | --- | ------ | --------- | ------- | -------- | ---------------------------------- |
| `PROJECT_DOCUMENT_READ`       | ✅    | 📖  | ✅     | ✅        | ✅      | ✅       | All project members can view       |
| `PROJECT_DOCUMENT_UPLOAD`     | ✅    | ❌  | ❌     | ✅        | ❌      | ❌       | ARCHITECT uploads design files     |
| `PROJECT_DOCUMENT_EDIT_OWN`   | ✅    | ❌  | ❌     | 🟢        | ❌      | ❌       | ARCHITECT edits own documents only |
| `PROJECT_DOCUMENT_DELETE_OWN` | ✅    | ❌  | ❌     | 🟢        | ❌      | ❌       | ARCHITECT deletes own documents    |

**Document Types:**

- `DESIGN` - Design files (AutoCAD, SketchUp, etc.)
- `DRAWING` - Technical drawings
- `REFERENCE` - Reference images/documents
- `SPECIFICATION` - Material specifications

**🟢 Conditional Rules:**

- ARCHITECT can edit/delete **only their own documents**
- Ownership verified via `ProjectDocument.userId === ctx.session.user.id`

---

## 4️⃣ Special Rules & Edge Cases

### 🔸 CEO Special Rules

> **CEO is read-only for project operations, but can do personal/monitoring actions**

| Scenario                 | Allowed? | Reason                  |
| ------------------------ | -------- | ----------------------- |
| View all projects        | ✅       | Oversight role          |
| View all daily reports   | ✅       | Monitoring              |
| **Comment on reports**   | ✅       | **Monitoring/feedback** |
| **Edit own profile**     | ✅       | **Personal action**     |
| Create/edit reports      | ❌       | Not a field worker      |
| Approve emergency fund   | ❌       | Not operational role    |
| Manage logistics         | ❌       | Not operational role    |
| Upload project documents | ❌       | Not ARCHITECT           |

**Implementation:**

```typescript
// In project-scoped guards
if (ctx.session.user.roleGlobal === "CEO") {
  // Allow specific mutations
  const allowedCEOMutations = ["PROFILE_EDIT_OWN", "REPORT_COMMENT_CREATE"];

  if (isMutationOperation && !allowedCEOMutations.includes(action)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "CEO has read-only access to project operations",
    });
  }
}
```

---

### 🔸 Ownership Guard Examples

#### Example 1: Edit Daily Report

```typescript
// Pseudo-logic
const report = await db.dailyReport.findUnique({ where: { id } });

if (ctx.session.user.roleGlobal !== "ADMIN") {
  // Non-admin must own the report
  if (report.userId !== ctx.session.user.id) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Can only edit own reports",
    });
  }
}
```

#### Example 2: Upload Report Media

```typescript
// Pseudo-logic
const report = await db.dailyReport.findUnique({ where: { id: reportId } });

if (
  report.userId !== ctx.session.user.id &&
  ctx.session.user.roleGlobal !== "ADMIN"
) {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Can only upload to own reports",
  });
}
```

---

### 🔸 Multi-Project Scenarios

**Question:** User adalah MANDOR di Project A dan FINANCE di Project B. Bagaimana?

**Answer:** Permission ditentukan **per project**.

| Scenario              | Project A (MANDOR) | Project B (FINANCE) |
| --------------------- | ------------------ | ------------------- |
| Create daily report   | ✅                 | ❌                  |
| Verify emergency fund | ❌                 | ✅                  |
| Manage logistics      | ⚠️ Limited         | ✅ Full             |

**Implementation:**

```typescript
// Always check project-specific role
const membership = await db.projectMember.findUnique({
  where: { userId_projectId: { userId, projectId } },
});

const projectRole = membership.role; // MANDOR or FINANCE
```

---

## 5️⃣ Implementation Checklist

### ✅ Already Implemented (Layer 1, 2, & 3)

- [x] Authentication guard (`ctx.session?.user`)
- [x] Active user check (`isActive === true`)
- [x] Global role check (`roleGlobal !== "NONE"`)
- [x] Admin procedure (`ADMIN` or `CEO` only)
- [x] Protected procedure (`ADMIN`, `CEO`, `USER`)
- [x] **Project context guard** (check `ProjectMember` existence via `projectProcedure`)
- [x] **Project role guard** (check `ProjectRole` for action in `requireProjectRole`)
- [x] **Ownership guard** (check `userId` for mutations on reports, documents, etc.)
- [x] **CEO read-only enforcement** (block mutations for CEO except comments)
- [x] **Action-based permission helpers** (e.g., `projectProcedure(['MANDOR', 'LOGISTIC'])`)

---

## 6️⃣ Error Messages Strategy

| Error Type     | HTTP Code | Message Template                                   | When to Use                    |
| -------------- | --------- | -------------------------------------------------- | ------------------------------ |
| `UNAUTHORIZED` | 401       | "Not authenticated"                                | No session                     |
| `FORBIDDEN`    | 403       | "Account is not active"                            | `isActive === false`           |
| `FORBIDDEN`    | 403       | "You do not have permission to access this system" | `roleGlobal === "NONE"`        |
| `FORBIDDEN`    | 403       | "Admin access required"                            | Non-admin accessing admin-only |
| `FORBIDDEN`    | 403       | "You are not a member of this project"             | Not in `ProjectMember`         |
| `FORBIDDEN`    | 403       | "Insufficient permissions for this action"         | Wrong project role             |
| `FORBIDDEN`    | 403       | "Can only edit own reports"                        | Ownership check failed         |
| `FORBIDDEN`    | 403       | "CEO has read-only access"                         | CEO attempting mutation        |
| `NOT_FOUND`    | 404       | "Project not found"                                | Invalid `projectId`            |

---

## 7️⃣ Next Steps

### Immediate Actions

1. Implement `LOGISTIC` enum in Prisma schema and database migration.
2. Update tRPC `logistic.router.ts` to assign item management to `LOGISTIC`.
3. Update UI dialogs (`member-management.tsx`, `create-user-dialog.tsx`, `approve-user-dialog.tsx`) to allow assigning the `LOGISTIC` role.
4. Add `isLogistic` to `use-user-role.ts`.

---

## 📌 Summary

| Layer                    | Status      | Coverage                                      |
| ------------------------ | ----------- | --------------------------------------------- |
| Layer 1: Authentication  | ✅ Complete | All users                                     |
| Layer 2: Global Role     | ✅ Complete | ADMIN, CEO, USER                              |
| Layer 3: Project Context | ✅ Complete | MANDOR, ARCHITECT, FINANCE, LOGISTIC          |

**Total Actions Defined:** 28 (4 global + 24 project-scoped)  
**Total Roles:** 3 Global + 4 Project = 7  
**Total Entities:** 11 (Project, User, DailyReport, DailyReportTask, ReportMedia, EmergencyFund, EmergencyTransaction, LogisticItem, LogisticTransaction, ProjectDocument, ReportComment)  
**Permission Combinations:** ~80+ scenarios covered  

---

**Document Version:** 3.0  
**Last Updated:** 2026-10-09  
**Status:** Updated with LOGISTIC Project Role & Layer 3 Verification  
**Changes:** Added LOGISTIC project role, re-assigned logistics master item management to LOGISTIC, set FINANCE logistics to read-only, verified Layer 3 implementation.
