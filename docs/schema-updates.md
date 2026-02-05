# 🗄️ Database Schema Updates — New Entities

> **Required schema changes based on updated permission matrix v2.0**

---

## 📋 Overview

Based on the updated requirements, we need to add **3 new entities** to the database:

1. **DailyReportTask** - Task breakdown for daily reports
2. **ProjectDocument** - ARCHITECT file uploads (design, drawings, etc.)
3. **ReportComment** - CEO monitoring comments (optional)

---

## 1️⃣ DailyReportTask Entity

### Purpose

Allow MANDOR/ARCHITECT to break down daily reports into specific tasks with:

- Task name
- Number of workers per task
- Progress percentage per task

### Prisma Schema

```prisma
model DailyReportTask {
  id          String      @id @default(cuid())
  reportId    String
  taskName    String      // e.g., "Pengecoran lantai 2", "Pemasangan bata"
  workerCount Int         @default(0) // Jumlah pekerja untuk task ini
  progress    Int         @default(0) // Progress 0-100%
  notes       String?     @db.Text // Optional notes

  report      DailyReport @relation(fields: [reportId], references: [id], onDelete: Cascade)

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([reportId])
  @@map("daily_report_task")
}
```

### Update DailyReport Model

```prisma
model DailyReport {
  id              String   @id @default(cuid())
  slug            String
  projectId       String
  userId          String
  reportDate      DateTime @default(now())

  // General info
  weather         String?  // e.g., "Cerah", "Hujan"
  totalWorkers    Int      @default(0) // Total pekerja hari ini
  location        String?  // e.g., "Villa A", "Lantai 2"
  issues          String?  @db.Text // Kendala di lapangan

  // Relations
  project Project @relation(fields: [projectId], references: [id])
  user    User    @relation(fields: [userId], references: [id])
  media   ReportMedia[]
  tasks   DailyReportTask[] // NEW: Task breakdown
  comments ReportComment[]   // NEW: Comments (optional)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([projectId, slug])
  @@index([projectId, reportDate])
  @@map("daily_report")
}
```

### Migration Notes

- Add `weather`, `totalWorkers`, `location` fields to existing `DailyReport`
- Remove or deprecate `taskDescription`, `manpowerCount`, `progressPercent` (moved to tasks)
- Create new `DailyReportTask` table

---

## 2️⃣ ProjectDocument Entity

### Purpose

Allow ARCHITECT to upload and manage project documents:

- Design files (AutoCAD, SketchUp, etc.)
- Technical drawings
- Reference images
- Material specifications

### Prisma Schema

```prisma
enum DocumentType {
  DESIGN
  DRAWING
  REFERENCE
  SPECIFICATION
  OTHER
}

model ProjectDocument {
  id          String       @id @default(cuid())
  projectId   String
  userId      String       // ARCHITECT who uploaded

  // File info
  fileName    String       // Original filename
  fileType    DocumentType @default(OTHER)
  publicId    String       // Cloudinary Public ID
  url         String       // Cloudinary Secure URL
  fileSize    Int?         // File size in bytes
  mimeType    String?      // e.g., "application/pdf", "image/png"

  // Metadata
  title       String?      // Optional title/description
  description String?      @db.Text
  version     String?      // e.g., "v1.0", "Rev A"

  // Relations
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  uploader    User         @relation(fields: [userId], references: [id])

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([projectId])
  @@index([userId])
  @@index([fileType])
  @@map("project_document")
}
```

### Update Project Model

```prisma
model Project {
  id          String        @id @default(cuid())
  name        String
  slug        String        @unique
  description String?       @db.Text
  location    String?
  startDate   DateTime?
  endDate     DateTime?
  status      ProjectStatus @default(ACTIVE)

  // Relations
  members       ProjectMember[]
  dailyReports  DailyReport[]
  emergencyFund EmergencyFund?
  logistics     LogisticItem[]
  documents     ProjectDocument[] // NEW

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@map("project")
}
```

### Update User Model

```prisma
model User {
  id            String    @id
  name          String
  email         String
  emailVerified Boolean   @default(false)
  image         String?

  // custom fields
  roleGlobal    GlobalRole @default(NONE)
  isActive      Boolean    @default(false)
  approvedAt    DateTime?
  approvedById  String?
  approvedBy    User?      @relation("UserApproval", fields: [approvedById], references: [id])
  approvals     User[]     @relation("UserApproval")

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @default(now()) @updatedAt

  // relations
  sessions      Session[]
  accounts      Account[]
  projectMembers ProjectMember[]
  reports        DailyReport[]
  requests       EmergencyTransaction[] @relation("RequestedBy")
  verifications  EmergencyTransaction[] @relation("VerifiedBy")
  logistics      LogisticTransaction[]
  documents      ProjectDocument[] // NEW
  comments       ReportComment[]   // NEW

  @@unique([email])
  @@map("user")
}
```

---

## 3️⃣ ReportComment Entity (Optional)

### Purpose

Allow CEO and other users to comment on daily reports for monitoring/feedback.

### Prisma Schema

```prisma
model ReportComment {
  id        String      @id @default(cuid())
  reportId  String
  userId    String
  content   String      @db.Text

  report    DailyReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  author    User        @relation(fields: [userId], references: [id])

  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@index([reportId])
  @@index([userId])
  @@map("report_comment")
}
```

---

## 4️⃣ Complete Updated Schema

### New Enums

```prisma
enum DocumentType {
  DESIGN
  DRAWING
  REFERENCE
  SPECIFICATION
  OTHER
}
```

### Summary of Changes

| Model             | Change Type  | Description                                                          |
| ----------------- | ------------ | -------------------------------------------------------------------- |
| `DailyReport`     | **Modified** | Added `weather`, `totalWorkers`, `location`, `tasks[]`, `comments[]` |
| `DailyReportTask` | **New**      | Task breakdown for reports                                           |
| `ProjectDocument` | **New**      | ARCHITECT file uploads                                               |
| `ReportComment`   | **New**      | Comments on reports (optional)                                       |
| `Project`         | **Modified** | Added `documents[]` relation                                         |
| `User`            | **Modified** | Added `documents[]`, `comments[]` relations                          |
| `DocumentType`    | **New Enum** | Document type classification                                         |

---

## 5️⃣ Migration Strategy

### Step 1: Add New Enums

```prisma
enum DocumentType {
  DESIGN
  DRAWING
  REFERENCE
  SPECIFICATION
  OTHER
}
```

### Step 2: Create New Tables

1. `DailyReportTask`
2. `ProjectDocument`
3. `ReportComment` (optional)

### Step 3: Update Existing Tables

**DailyReport:**

- Add nullable fields: `weather`, `totalWorkers`, `location`
- Keep old fields for backward compatibility initially
- Plan migration to move data from old fields to tasks

**Project:**

- Add `documents` relation (no schema change, just Prisma relation)

**User:**

- Add `documents`, `comments` relations (no schema change)

### Step 4: Data Migration (if needed)

If you have existing `DailyReport` data:

```sql
-- Example: Migrate old taskDescription to new DailyReportTask
INSERT INTO daily_report_task (id, reportId, taskName, workerCount, progress, createdAt, updatedAt)
SELECT
  gen_random_uuid(),
  id,
  taskDescription,
  manpowerCount,
  progressPercent,
  createdAt,
  updatedAt
FROM daily_report
WHERE taskDescription IS NOT NULL;
```

---

## 6️⃣ Implementation Priority

### Phase 1: Core Features (High Priority)

1. ✅ `DailyReportTask` - Essential for daily report breakdown
2. ✅ `ProjectDocument` - Essential for ARCHITECT workflow

### Phase 2: Enhancement (Medium Priority)

3. ⚠️ `ReportComment` - Nice to have for CEO monitoring

### Phase 3: Cleanup (Low Priority)

4. 🔄 Deprecate old `DailyReport` fields (`taskDescription`, `manpowerCount`, `progressPercent`)

---

## 7️⃣ Validation Rules

### DailyReportTask

- `taskName`: Required, max 255 chars
- `workerCount`: Min 0, max 999
- `progress`: Min 0, max 100

### ProjectDocument

- `fileName`: Required
- `fileType`: Required enum
- `publicId`: Required (Cloudinary)
- `url`: Required (Cloudinary)
- `fileSize`: Optional, max 100MB (100000000 bytes)
- `mimeType`: Optional, validate against allowed types

### ReportComment

- `content`: Required, min 1 char, max 5000 chars

---

## 8️⃣ Indexes for Performance

```prisma
// DailyReportTask
@@index([reportId])

// ProjectDocument
@@index([projectId])
@@index([userId])
@@index([fileType])

// ReportComment
@@index([reportId])
@@index([userId])

// DailyReport (updated)
@@index([projectId, reportDate])
```

---

## 9️⃣ Example Queries

### Get Daily Report with Tasks

```typescript
const report = await db.dailyReport.findUnique({
  where: { id: reportId },
  include: {
    tasks: true,
    media: true,
    comments: {
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    },
  },
});
```

### Get Project Documents by Type

```typescript
const designs = await db.projectDocument.findMany({
  where: {
    projectId,
    fileType: "DESIGN",
  },
  include: {
    uploader: {
      select: { id: true, name: true },
    },
  },
  orderBy: { createdAt: "desc" },
});
```

---

## 🔟 Next Steps

1. **Review this schema** with team
2. **Update `prisma/schema.prisma`** with new models
3. **Run migration:**
   ```bash
   npx prisma migrate dev --name add_report_tasks_and_documents
   ```
4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```
5. **Update tRPC routers** to use new entities
6. **Update frontend** to display tasks and documents

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-02 20:35 WIB  
**Status:** Ready for Implementation  
**Related:** [permission-matrix.md v2.0](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-matrix.md)
