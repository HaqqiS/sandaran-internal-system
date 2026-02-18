# Known Issues and Potential Bugs

## 1. Cloudinary Folder Rename - Broken URLs

When a project's `slug` is updated, the system automatically renames the corresponding folder in Cloudinary to match the new slug (e.g., `sandaran/old-slug` -> `sandaran/new-slug`).

### The Issue

While the folder in Cloudinary is successfully renamed, the database records for existing files (`ProjectDocument`, `ReportMedia`, `EmergencyTransaction` proof) **are NOT updated**.

This means that existing URLs in the database still point to the old folder path:

- **Database URL**: `https://.../sandaran/old-slug/image.jpg`
- **Actual File Location**: `sandaran/new-slug/image.jpg`

### Symptom

- Users will encounter **404 Not Found** errors when trying to access previously uploaded files after renaming a project slug.
- New uploads will work correctly as they use the new slug.

### Required Fix

When renaming the project slug, a database migration/update script must be run to update all affected tables:

1.  **ProjectDocument**: Update `publicId` and `url`.
2.  **ReportMedia** (via DailyReport): Update `publicId` and `url`.
3.  **EmergencyTransaction**: Update `proofPublicId`.

This requires a carefully orchestrated transaction to prevent data inconsistency.

### Current Workaround

Avoid renaming project slugs if they already contain uploaded files. If renaming is necessary, be aware that old file links will break.

## 2. Improving form

- **logistics Form**: error unknown value, amount can caracter.
- **Sheet Form**: broken in mobile view, cannot scroll to bottom.

## 3. Improving UI/UX

**Sidebar Header**

- just previus page

**Project[slug]/\*\***

- mobile view still broken, at header sidebar or even the data-table still overwidth
