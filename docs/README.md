# 📚 Sandaran Internal System - Dokumentasi

> **Index utama untuk semua dokumentasi sistem**

---

## 📖 Daftar Dokumen

### [auth-system.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/auth-system.md)

**Contoh lengkap penggunaan fungsiAuth Guards** - Panduan praktis untuk menggunakan fungsi-fungsi autentikasi seperti `isAuthorizedRole`, `isAdmin`, `validateSessionAccess`, dan helper functions lainnya. Berisi code examples untuk protected pages, conditional UI, dan server actions.

---

### [frontend-implementation-plan.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/frontend-implementation-plan.md)

**Rencana implementasi frontend UI** - Dokumen perencanaan bertahap (9 fase) untuk membangun UI lengkap sistem, dari Project Management, Daily Reports dengan media upload, Emergency Fund, hingga Logistics dan Documents. Termasuk tech stack (Next.js 15, shadcn/ui, TanStack Form, Cloudinary).

---

### [permission-flows.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/permission-flows.md)

**Diagram alur sistem permission** - Visual flowchart menggunakan Mermaid untuk menjelaskan 3-Layer Permission System (Authentication → Global Role → Project Context). Berisi 9 diagram termasuk ownership guard, role-specific flows, dan workflow emergency fund & logistics.

---

### [permission-matrix.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/permission-matrix.md)

**Tabel permission lengkap** - Dokumen referensi utama yang mendefinisikan 28 action codes (4 global + 24 project-scoped), 6 roles (ADMIN, CEO, USER, MANDOR, ARCHITECT, FINANCE), dan permission matrix detail untuk setiap fitur. Termasuk special rules untuk CEO read-only dan ownership guards.

---

### [permission-quick-reference.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/permission-quick-reference.md)

**Cheat sheet untuk developer** - Panduan cepat memilih procedure yang tepat (`publicProcedure`, `protectedProcedure`, `adminProcedure`, `projectProcedure`) dengan decision tree, code examples, helper functions, dan debugging tips untuk implementasi tRPC permission guards.

---

### [roles-and-permissions.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/roles-and-permissions.md)

**Panduan role dan hak akses (Bahasa Indonesia)** - Penjelasan konsep Global Role vs Project Role, detail permission per fitur (Laporan Harian, Dana Darurat, Logistik, Dokumen), dan matriks ringkasan yang mudah dipahami untuk stakeholder non-teknis.

---

### [ui-flow-map.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/ui-flow-map.md)

**Peta navigasi UI per role** - Diagram Mermaid yang menampilkan user flow dan struktur navigasi untuk masing-masing role (ADMIN, CEO, MANDOR, ARCHITECT, FINANCE). Menjelaskan halaman apa saja yang dapat diakses dan aksi apa yang bisa dilakukan setiap role di setiap modul.

---

## 🎯 Quick Start Guide

### Untuk Developer Baru

1. Mulai dengan [roles-and-permissions.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/roles-and-permissions.md) untuk memahami konsep dasar
2. Lihat [permission-flows.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/permission-flows.md) untuk visualisasi sistem
3. Gunakan [permission-quick-reference.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/permission-quick-reference.md) saat coding
4. Referensi [auth-system.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/auth-system.md) untuk contoh implementasi

### Untuk Frontend Developer

1. Baca [frontend-implementation-plan.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/frontend-implementation-plan.md) untuk roadmap UI
2. Lihat [ui-flow-map.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/ui-flow-map.md) untuk memahami navigasi

### Untuk Project Manager / Stakeholder

1. [roles-and-permissions.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/roles-and-permissions.md) - Ringkasan hak akses yang mudah dipahami
2. [ui-flow-map.md](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/docs/ui-flow-map.md) - Visual flow untuk setiap role

---

**Terakhir diperbarui:** 2026-02-11

---

## 🎯 Quick Links by Use Case

### "I want to understand the permission system"

→ Start with [Permission Matrix](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-matrix.md)

### "I need to see the flow visually"

→ Check [Permission Flows](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-flows.md)

### "I'm implementing a new router"

→ Use [Quick Reference](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-quick-reference.md)

### "What's already done?"

→ Read [Status Summary](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-status.md)

### "What do I need to build?"

→ Follow [Implementation Checklist](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/implementation-checklist.md)

---

## 📖 Recommended Reading Order

### For Developers (First Time)

1. **[Status Summary](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-status.md)** (5 min)
   - Understand what's already implemented
   - See the big picture

2. **[Permission Matrix](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-matrix.md)** (15 min)
   - Learn all roles and actions
   - Understand special rules

3. **[Permission Flows](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-flows.md)** (10 min)
   - Visualize the logic flow
   - See role-specific paths

4. **[Quick Reference](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-quick-reference.md)** (Keep open while coding)
   - Copy-paste code examples
   - Follow patterns

5. **[Implementation Checklist](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/implementation-checklist.md)** (Reference during work)
   - Track progress
   - Follow task order

---

### For Architects / Tech Leads

1. **[Permission Matrix](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-matrix.md)** - Understand the design
2. **[Permission Flows](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-flows.md)** - Review the architecture
3. **[Status Summary](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-status.md)** - Check implementation status

---

### For Project Managers

1. **[Status Summary](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-status.md)** - See what's done
2. **[Implementation Checklist](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/implementation-checklist.md)** - Track progress
3. **[Permission Matrix](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-matrix.md)** (Section 7: Next Steps) - Understand roadmap

---

## 📊 Document Details

### 1. Permission Matrix

**File:** [permission-matrix.md](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-matrix.md)

**Contains:**

- 20 action codes (global + project-scoped)
- 6 roles (3 global + 3 project)
- Complete permission table
- Special rules (CEO read-only, ownership guards)
- Edge cases (multi-project scenarios)
- Error message strategy

**Key Sections:**

- Permission Vocabulary
- Role Definitions
- Complete Permission Matrix
- Special Rules & Edge Cases
- Implementation Checklist

**When to reference:**

- Designing new features
- Resolving permission questions
- Onboarding new team members

---

### 2. Permission Flows

**File:** [permission-flows.md](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-flows.md)

**Contains:**

- 9 Mermaid diagrams
- 3-layer permission flow
- Role-specific flows (MANDOR, ARCHITECT, FINANCE)
- Workflow sequences (emergency fund, logistics)
- CEO read-only enforcement diagram

**Key Diagrams:**

1. Overall Permission Flow (high-level)
2. Layer 1: Authentication Guard
3. Layer 2: Global Role Guard
4. Layer 3: Project Context Guard
5. Ownership Guard Flow
6. Role-Specific Flows (3 diagrams)
7. Emergency Fund Workflow
8. Logistic Transaction Workflow
9. CEO Read-Only Enforcement

**When to reference:**

- Understanding permission logic
- Debugging permission issues
- Explaining system to stakeholders

---

### 3. Quick Reference

**File:** [permission-quick-reference.md](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-quick-reference.md)

**Contains:**

- Decision tree for choosing procedures
- Code examples (6 patterns)
- Helper function templates (4 functions)
- Common patterns (3 scenarios)
- Debugging tips
- Error handling checklist

**Key Sections:**

- Quick Decision Tree
- Available Procedures
- Code Examples (public, protected, admin, project-scoped)
- Guard Helper Functions
- Common Patterns
- Debugging Tips

**When to reference:**

- Writing new routers
- Implementing guards
- Troubleshooting errors

---

### 4. Status Summary

**File:** [permission-status.md](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-status.md)

**Contains:**

- Current implementation status
- Layer 1 & 2 analysis (✅ complete)
- Layer 3 requirements (🔜 pending)
- 5-phase roadmap
- 3 review questions
- Next steps

**Key Sections:**

- Status Implementasi (Layer 1, 2, 3)
- Ringkasan (summary table)
- Apa yang Sudah Kamu Punya?
- Next Steps (Roadmap)
- Pertanyaan untuk Review

**When to reference:**

- Checking what's done
- Planning next steps
- Reporting progress

---

### 5. Implementation Checklist

**File:** [implementation-checklist.md](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/implementation-checklist.md)

**Contains:**

- 23 detailed tasks
- 5 implementation phases
- Acceptance criteria for each task
- Test cases
- Code snippets
- Progress tracking

**Phases:**

1. Helper Functions (4 tasks, 2-3 hours)
2. Middleware (3 tasks, 3-4 hours)
3. Router Updates (8 tasks, 4-6 hours)
4. Testing (5 tasks, 3-4 hours)
5. Documentation (3 tasks, 1-2 hours)

**Total Effort:** 13-19 hours

**When to reference:**

- Starting implementation
- Tracking progress
- Reviewing completed work

---

## 🗺️ Documentation Map

```
Permission System Documentation
│
├─ 📊 Conceptual
│  ├─ Permission Matrix ────────── What can each role do?
│  └─ Permission Flows ────────── How does it work?
│
├─ 🔧 Practical
│  ├─ Quick Reference ─────────── How do I code this?
│  └─ Implementation Checklist ── What tasks are needed?
│
└─ 📈 Status
   └─ Status Summary ──────────── What's done? What's next?
```

---

## 🎯 Key Concepts

### 3-Layer Permission System

| Layer       | What it checks                            | Status         |
| ----------- | ----------------------------------------- | -------------- |
| **Layer 1** | Authentication, isActive, roleGlobal      | ✅ Implemented |
| **Layer 2** | Global role (ADMIN, CEO, USER)            | ✅ Implemented |
| **Layer 3** | Project role (MANDOR, ARCHITECT, FINANCE) | 🔜 Pending     |

### 6 Roles in the System

**Global Roles:**

1. `ADMIN` - Full system access
2. `CEO` - Read-only all projects
3. `USER` - Access based on project role

**Project Roles:** 4. `MANDOR` - Site supervisor 5. `ARCHITECT` - Project architect 6. `FINANCE` - Financial officer

### 20 Action Codes

**Global Actions (4):**

- SYSTEM_ACCESS
- USER_MANAGEMENT
- MASTER_DATA_CRUD
- ALL_PROJECTS_READ

**Project Actions (16):**

- PROJECT_READ, PROJECT_ADMIN
- REPORT_CREATE, REPORT_EDIT_OWN, REPORT_EDIT_ANY, etc.
- EMERGENCY_REQUEST, EMERGENCY_VERIFY, EMERGENCY_BALANCE_ADD
- LOGISTIC_READ, LOGISTIC_CREATE_ITEM, LOGISTIC_IN, LOGISTIC_OUT, etc.

---

## 🚀 Getting Started

### If you're implementing Layer 3:

1. Read [Status Summary](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-status.md) to understand current state
2. Review [Permission Matrix](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-matrix.md) to understand requirements
3. Open [Implementation Checklist](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/implementation-checklist.md) and start with Phase 1, Task 1.1
4. Keep [Quick Reference](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-quick-reference.md) open for code examples

### If you're debugging permission issues:

1. Check [Permission Flows](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-flows.md) to understand the flow
2. Use debugging tips in [Quick Reference](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-quick-reference.md)
3. Verify against [Permission Matrix](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-matrix.md)

---

## 📝 Document Maintenance

### When to update these docs:

- [ ] New role added → Update Permission Matrix
- [ ] New action added → Update Permission Matrix & Flows
- [ ] Layer 3 implemented → Update Status Summary
- [ ] New pattern discovered → Update Quick Reference
- [ ] Task completed → Update Implementation Checklist

### Document Owners:

- **Permission Matrix** - System Architect
- **Permission Flows** - System Architect
- **Quick Reference** - Lead Developer
- **Status Summary** - Tech Lead
- **Implementation Checklist** - Project Manager / Tech Lead

---

## 🔗 Related Files in Codebase

| File                                                                                                          | Purpose                       | Status           |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------- |
| [`src/server/api/trpc.ts`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/server/api/trpc.ts) | tRPC procedures (Layer 1 & 2) | ✅ Implemented   |
| `src/server/api/helpers/permission.ts`                                                                        | Permission helper functions   | 🔜 To be created |
| [`prisma/schema.prisma`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/prisma/schema.prisma)     | Database schema with roles    | ✅ Implemented   |
| `src/server/api/routers/project.router.ts`                                                                    | Project endpoints             | 🔜 To be created |
| `src/server/api/routers/report.router.ts`                                                                     | Daily report endpoints        | 🔜 To be created |
| `src/server/api/routers/emergency.router.ts`                                                                  | Emergency fund endpoints      | 🔜 To be created |
| `src/server/api/routers/logistic.router.ts`                                                                   | Logistics endpoints           | 🔜 To be created |

---

## 📊 Summary Statistics

- **Total Documents:** 6
- **Total Pages:** ~50 (estimated)
- **Total Diagrams:** 9 (Mermaid)
- **Total Code Examples:** 15+
- **Total Tasks:** 23
- **Estimated Implementation Time:** 13-19 hours

---

## ✅ Completion Status

| Document                 | Status      | Last Updated |
| ------------------------ | ----------- | ------------ |
| Permission Matrix        | ✅ Complete | 2026-02-02   |
| Permission Flows         | ✅ Complete | 2026-02-02   |
| Quick Reference          | ✅ Complete | 2026-02-02   |
| Status Summary           | ✅ Complete | 2026-02-02   |
| Implementation Checklist | ✅ Complete | 2026-02-02   |
| Index (this file)        | ✅ Complete | 2026-02-02   |

---

**All documentation is ready for review and implementation!** 🎉

**Next Action:** Review the 3 questions in [Status Summary](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-status.md) before starting implementation.
