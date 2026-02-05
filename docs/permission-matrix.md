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

| Role          | Code        | Description       | Primary Responsibilities                             |
| ------------- | ----------- | ----------------- | ---------------------------------------------------- |
| **Mandor**    | `MANDOR`    | Site supervisor   | Daily reports, emergency requests, limited logistics |
| **Architect** | `ARCHITECT` | Project architect | Daily reports, project documents, design files       |
| **Finance**   | `FINANCE`   | Financial officer | Emergency fund verification, logistics management    |

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

| Action          | ADMIN | CEO | MANDOR | ARCHITECT | FINANCE | Notes               |
| --------------- | ----- | --- | ------ | --------- | ------- | ------------------- |
| `PROJECT_READ`  | ✅    | 📖  | ✅     | ✅        | ✅      | All project members |
| `PROJECT_ADMIN` | ✅    | ❌  | ❌     | ❌        | ❌      | ADMIN only          |

---

#### B. Daily Reports

| Action                  | ADMIN | CEO | MANDOR | ARCHITECT | FINANCE | Notes                                 |
| ----------------------- | ----- | --- | ------ | --------- | ------- | ------------------------------------- |
| `REPORT_CREATE`         | ✅    | ❌  | ✅     | ✅        | ❌      | Field workers only                    |
| `REPORT_EDIT_OWN`       | ✅    | ❌  | 🟢     | 🟢        | ❌      | Own reports only (ownership check)    |
| `REPORT_EDIT_ANY`       | ✅    | ❌  | ❌     | ❌        | ❌      | ADMIN only                            |
| `REPORT_DELETE_OWN`     | ✅    | ❌  | 🟢     | 🟢        | ❌      | Own reports only (ownership check)    |
| `REPORT_DELETE_ANY`     | ✅    | ❌  | ❌     | ❌        | ❌      | ADMIN only                            |
| `REPORT_MEDIA_UPLOAD`   | ✅    | ❌  | 🟢     | 🟢        | ❌      | Only to own reports (ownership check) |
| `REPORT_TASK_CREATE`    | ✅    | ❌  | 🟢     | 🟢        | ❌      | Add task breakdown to own report      |
| `REPORT_TASK_EDIT_OWN`  | ✅    | ❌  | 🟢     | 🟢        | ❌      | Edit tasks in own report              |
| `REPORT_COMMENT_CREATE` | ✅    | ✅  | ✅     | ✅        | ✅      | CEO can comment for monitoring        |

**🟢 Conditional Rules:**

- MANDOR/ARCHITECT can edit/delete **only their own reports**
- Ownership verified via `DailyReport.userId === ctx.session.user.id`
- CEO can **comment** on reports (monitoring exception)

---

#### C. Emergency Fund

| Action                  | ADMIN | CEO | MANDOR | ARCHITECT | FINANCE | Notes                             |
| ----------------------- | ----- | --- | ------ | --------- | ------- | --------------------------------- |
| `EMERGENCY_REQUEST`     | ✅    | ❌  | ✅     | ❌        | ❌      | MANDOR requests, FINANCE verifies |
| `EMERGENCY_VERIFY`      | ✅    | ❌  | ❌     | ❌        | ✅      | FINANCE approves/rejects          |
| `EMERGENCY_BALANCE_ADD` | ✅    | ❌  | ❌     | ❌        | ✅      | FINANCE adds initial balance      |

**Flow:**

1. MANDOR creates `EmergencyTransaction` (status: PENDING)
2. FINANCE verifies → status: APPROVED/REJECTED
3. Only FINANCE can add balance to `EmergencyFund`

---

#### D. Logistics

| Action                 | ADMIN | CEO | MANDOR | ARCHITECT | FINANCE | Notes                                |
| ---------------------- | ----- | --- | ------ | --------- | ------- | ------------------------------------ |
| `LOGISTIC_READ`        | ✅    | 📖  | ✅     | 📖        | ✅      | All can view                         |
| `LOGISTIC_CREATE_ITEM` | ✅    | ❌  | ❌     | ❌        | ✅      | FINANCE manages items                |
| `LOGISTIC_REQUEST`     | ✅    | ❌  | ✅     | ❌        | ✅      | MANDOR requests, FINANCE full access |
| `LOGISTIC_CONFIRM`     | ✅    | ❌  | ✅     | ❌        | ✅      | MANDOR confirms delivery/usage       |
| `LOGISTIC_APPROVE`     | ✅    | ❌  | ❌     | ❌        | ✅      | FINANCE approves requests            |

**Flow:**

1. MANDOR creates `LOGISTIC_REQUEST` (status: PENDING)
2. FINANCE approves → `LOGISTIC_APPROVE` (status: APPROVED)
3. MANDOR confirms delivery → `LOGISTIC_CONFIRM` (status: CONFIRMED)
4. FINANCE can do all steps directly (bypass approval)

---

#### E. Project Documents (NEW)

| Action                        | ADMIN | CEO | MANDOR | ARCHITECT | FINANCE | Notes                              |
| ----------------------------- | ----- | --- | ------ | --------- | ------- | ---------------------------------- |
| `PROJECT_DOCUMENT_READ`       | ✅    | 📖  | ✅     | ✅        | ✅      | All project members can view       |
| `PROJECT_DOCUMENT_UPLOAD`     | ✅    | ❌  | ❌     | ✅        | ❌      | ARCHITECT uploads design files     |
| `PROJECT_DOCUMENT_EDIT_OWN`   | ✅    | ❌  | ❌     | 🟢        | ❌      | ARCHITECT edits own documents only |
| `PROJECT_DOCUMENT_DELETE_OWN` | ✅    | ❌  | ❌     | 🟢        | ❌      | ARCHITECT deletes own documents    |

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

### ✅ Already Implemented (Layer 1 & 2)

- [x] Authentication guard (`ctx.session?.user`)
- [x] Active user check (`isActive === true`)
- [x] Global role check (`roleGlobal !== "NONE"`)
- [x] Admin procedure (`ADMIN` or `CEO` only)
- [x] Protected procedure (`ADMIN`, `CEO`, `USER`)

### 🔜 To Be Implemented (Layer 3)

- [ ] **Project context guard** (check `ProjectMember` existence)
- [ ] **Project role guard** (check `ProjectRole` for action)
- [ ] **Ownership guard** (check `userId` for mutations)
- [ ] **CEO read-only enforcement** (block mutations for CEO)
- [ ] **Action-based permission helpers** (e.g., `requireProjectRole(['MANDOR', 'FINANCE'])`)

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

1. **Review this matrix** with stakeholders
2. **Confirm edge cases** (especially MANDOR logistics access)
3. **Decide on MANDOR logistics flow:**
   - Option A: MANDOR can directly IN/OUT (current matrix: ⚠️)
   - Option B: MANDOR only requests, FINANCE approves (stricter)

### After Approval

1. Create **guard helper functions** (e.g., `requireProjectRole`)
2. Implement **project context middleware**
3. Update **tRPC routers** with new guards
4. Write **integration tests** for permission scenarios

---

## 📌 Summary

| Layer                    | Status      | Coverage                   |
| ------------------------ | ----------- | -------------------------- |
| Layer 1: Authentication  | ✅ Complete | All users                  |
| Layer 2: Global Role     | ✅ Complete | ADMIN, CEO, USER           |
| Layer 3: Project Context | 🔜 Pending  | MANDOR, ARCHITECT, FINANCE |

**Total Actions Defined:** 28 (4 global + 24 project-scoped)
**Total Roles:** 3 Global + 3 Project = 6
**Total Entities:** 11 (Project, User, DailyReport, DailyReportTask, ReportMedia, EmergencyFund, EmergencyTransaction, LogisticItem, LogisticTransaction, ProjectDocument, ReportComment)
**Permission Combinations:** ~70+ scenarios covered

---

**Document Version:** 2.0  
**Last Updated:** 2026-02-02 20:30 WIB  
**Status:** Updated with User Requirements  
**Changes:** Added DailyReportTask, ProjectDocument, refined CEO permissions, updated logistics flow
