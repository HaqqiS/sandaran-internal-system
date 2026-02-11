# System UI Flow Map

This document outlines the user interface flow and navigation structure for each role in the Sandaran Internal System.

## Roles Overview

- **ADMIN**: Full system access, management of projects, users, and master data.
- **CEO**: High-level overview, monitoring, and read-only insights.
- **MANDOR**: Project-specific operations, report creation, and logistics requests.
- **ARCHITECT**: Design-focused access, document management, and read-only logistics.
- **FINANCE**: Financial oversight, approval workflows, and transaction history.

---

## Global Navigation Rules

- Routes are not role-specific; access is controlled by permission guards.
- UI elements (menus, buttons) are conditionally rendered based on action permissions.
- Unauthorized access redirects to /403.
- Project routes always require project context validation.

---

## 1. ADMIN Flow

Admins have comprehensive access to all modules.

```mermaid
graph TD
    Dashboard[Dashboard] --> ProjectsSummary[Projects Summary]
    Dashboard --> EmLogStats["Emergency & Logistics Stats"]
    Dashboard --> QuickJump["Quick Jump to Project"]

    Projects["Projects List"] --> CreateProject["Create Project"]
    Projects --> FilterSearch["Search / Filter"]
    Projects --> ProjectDetail["Project Detail /projects/:slug"]

    ProjectDetail --> Overview[Overview]
    ProjectDetail --> EditInfo["Edit Info"]
    ProjectDetail --> ManageMembers["Manage Members"]
    ProjectDetail --> ProjectModules["Project Modules"]

    ProjectModules --> Reports["Reports /reports"]
    Reports --> ViewReports["View All Reports"]
    Reports --> CreateReport["Create Report(Optional / Debug / Override)"]
    Reports --> ReportDetail["Report Detail /reports/:slug"]
    ReportDetail --> EditReport[Edit]
    ReportDetail --> DeleteReport[Delete]
    ReportDetail --> UploadMedia["Upload Media"]
    ReportDetail --> Comment[Comment]

    ProjectModules --> Emergency["Emergency /emergency"]
    Emergency --> FundBalance["View Balance"]
    Emergency --> AllRequests["All Requests"]
    Emergency --> ApproveReject["Approve/Reject"]
    Emergency --> AddBalance["Add Balance"]

    ProjectModules --> Logistics["Logistics /logistics"]
    Logistics --> ViewItems["View Items"]
    Logistics --> CreateEditItem["Create/Edit Item"]
    Logistics --> RequestInOut["Request IN/OUT"]
    Logistics --> ApproveRequest["Approve Request"]
    Logistics --> ConfirmUsage["Confirm Usage"]

    ProjectModules --> Documents["Documents /documents"]
    Documents --> ViewDocs["View All"]
    Documents --> UploadDoc[Upload]
    Documents --> EditDeleteDoc["Edit/Delete"]
    Documents --> DownloadDoc[Download]

    Users["Users Management /users"] --> ListUsers["List All Users"]
    Users --> ApproveUser["Approve/Deactivate"]
    Users --> EditRole["Edit Role"]

    Master["Master Data /master"] --> MasterLogistics["Master Logistics"]
    Master --> MasterEmergency["Master Emergency Categories"]
    Master --> SystemConfig["System Config"]
```

---

## 2. CEO Flow

CEOs focus on High-level overview, monitoring, and read-only insights.

```mermaid
graph TD
    Dashboard[Dashboard] --> GlobalOverview["Global Overview"]
    Dashboard --> KPISummary["KPI Summary"]
    Dashboard --> Alerts["Alerts (Read Only)"]

    Projects["All Projects /projects"] --> ProjectDetail["Project Detail"]

    ProjectDetail --> Overview[Overview]
    ProjectDetail --> Members["View Members"]
    ProjectDetail --> ProjectModules["Monitoring Modules"]

    ProjectModules --> Reports[Reports]
    Reports --> ViewReports["View All"]
    Reports --> ReportDetail["Report Detail"]
    ReportDetail --> ViewContent["View Content"]
    ReportDetail --> Comment["Comment (Allowed)"]

    ProjectModules --> Emergency[Emergency]
    Emergency --> ViewBalance["View Balance"]
    Emergency --> RequestHistory["View Request History"]

    ProjectModules --> Logistics[Logistics]
    Logistics --> ViewHistory["View Items & History"]

    ProjectModules --> Documents[Documents]
    Documents --> ViewDownload["View & Download"]

    Profile[Profile] --> EditProfile["Edit Profile"]
```

---

## 3. MANDOR Flow

Mandors operate within assigned projects, focusing on daily reporting and logistics.

```mermaid
graph TD
    Dashboard[Dashboard] --> AssignedProjects["Assigned Projects"]
    Dashboard --> TodayReports["Today's Reports Shortcut"]
    Dashboard --> PendingStatus["Pending Requests Status"]

    Projects[Projects] --> JoinedProjects["View Joined Projects Only"]
    JoinedProjects --> ProjectDetail["Project Detail"]

    ProjectDetail --> Info["Project Info"]
    ProjectDetail --> Operational["Operational Modules"]

    Operational --> Reports[Reports]
    Reports --> ViewReports["View Reports"]
    Reports --> CreateReport["Create Report"]
    Reports --> ReportDetail["Report Detail"]
    ReportDetail --> EditOwn["Edit Own Report"]
    ReportDetail --> UploadMedia["Upload Media"]
    ReportDetail --> Comment[Comment]

    Operational --> Emergency[Emergency]
    Emergency --> ViewFund["View Fund"]
    Emergency --> RequestFund["Request Fund"]

    Operational --> Logistics[Logistics]
    Logistics --> ViewItems["View Items"]
    Logistics --> RequestInOut["Request IN/OUT"]
    Logistics --> ConfirmDelivery["Confirm Delivery"]

    Operational --> Documents[Documents]
    Documents --> ViewDocs["View Documents(View & Download)"]

    Profile[Profile] --> EditProfile["Edit Own Profile"]
```

---

## 4. ARCHITECT Flow

Architects manage designs and documentation.

```mermaid
graph TD
    Dashboard[Dashboard] --> ProjectOverview["Project Overview"]
    Dashboard --> DocShortcuts["Document Shortcuts"]

    Projects[Projects] --> JoinedProjects["View Joined Projects"]
    JoinedProjects --> ProjectDetail["Project Detail"]

    ProjectDetail --> ViewProject["View Project"]
    ProjectDetail --> DesignModules["Design Modules"]

    DesignModules --> Reports[Reports]
    Reports --> CreateReport["Create Report"]
    Reports --> EditOwn["Edit Own Report"]

    DesignModules --> Documents[Documents]
    Documents --> UploadDoc["Upload Document"]
    Documents --> EditDeleteOwn["Edit/Delete Own"]
    Documents --> DownloadDoc[Download]

    DesignModules --> Logistics["Logistics (Read Only)"]
    DesignModules --> Emergency["Emergency (Read Only)"]

    Profile[Profile] --> EditProfile["Edit Own Profile"]
```

---

## 5. FINANCE Flow

Finance manages approvals and tracks transactions.

```mermaid
graph TD
    Dashboard[Dashboard] --> PendingApprovals["Pending Approvals"]
    Dashboard --> Alerts["Fund & Logistics Alerts"]

    Projects[Projects] --> JoinedProjects["View Joined Projects"]
    JoinedProjects --> ProjectDetail["Project Detail"]

    ProjectDetail --> FinancialModules["Financial Modules"]

    FinancialModules --> Emergency[Emergency]
    Emergency --> ViewBalance["View Balance"]
    Emergency --> VerifyRequests["Verify Requests"]
    Emergency --> AddBalance["Add Fund Balance"]

    FinancialModules --> Logistics[Logistics]
    Logistics --> ManageItems["Manage Items"]
    Logistics --> ApproveRequest["Approve Request"]
    Logistics --> History["Full Transaction History"]

    FinancialModules --> Reports["Reports (View Only)"]
    FinancialModules --> Documents["Documents (View Only)"]

    Profile[Profile] --> EditProfile["Edit Own Profile"]
```
