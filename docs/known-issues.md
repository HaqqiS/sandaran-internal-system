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

## 4. Broken Mobile UI

1. layout dashboard

- close sidebar after klick menu
- select project broken if project's name to long
- sidebar header broken if many content link 2 button and project's name to long

2. admin dashboard

- Quick Actions

3. projects

- sheet create/edit project
- sheet create/edit project' report

4. emergency

- the data-table break through screen
- add fund emergency still using modal change to sheet
- emergency page, set colors of chart

5. logistics

- create & edit still using modal
- in and out stock still using modal
- change detele modal look a like delete modal in documents but button confirm is red

6. documents

- create still using modal
- on the delete modal, the confirmation button is black. change to red

## 5. Make Gallerys UI for each project and recent gallery all projects
