# 🎨 Permission Flow Diagrams

> **Visual representation of 3-Layer Permission System**

---

## 1️⃣ Overall Permission Flow (High-Level)

```mermaid
flowchart TD
    Start([User makes request]) --> Auth{Layer 1:<br/>Authenticated?}

    Auth -->|No session| Reject1[❌ UNAUTHORIZED<br/>Not authenticated]
    Auth -->|Has session| Active{Is Active?}

    Active -->|isActive = false| Reject2[❌ FORBIDDEN<br/>Account not active]
    Active -->|isActive = true| RoleCheck{roleGlobal?}

    RoleCheck -->|NONE| Reject3[❌ FORBIDDEN<br/>No permission]
    RoleCheck -->|ADMIN/CEO/USER| Layer2{Layer 2:<br/>Global Role<br/>Required?}

    Layer2 -->|Admin Only| AdminCheck{Is ADMIN<br/>or CEO?}
    AdminCheck -->|No| Reject4[❌ FORBIDDEN<br/>Admin access required]
    AdminCheck -->|Yes| Layer3

    Layer2 -->|Protected Only| Layer3{Layer 3:<br/>Project<br/>Context?}

    Layer3 -->|No project| Success1[✅ Allow<br/>Global action]
    Layer3 -->|Has projectId| ProjectMember{Is Project<br/>Member?}

    ProjectMember -->|No| Reject5[❌ FORBIDDEN<br/>Not project member]
    ProjectMember -->|Yes| RoleMatch{Project Role<br/>Matches Action?}

    RoleMatch -->|No| Reject6[❌ FORBIDDEN<br/>Insufficient permissions]
    RoleMatch -->|Yes| Ownership{Ownership<br/>Required?}

    Ownership -->|No| Success2[✅ Allow]
    Ownership -->|Yes| OwnerCheck{Is Owner?}

    OwnerCheck -->|No| Reject7[❌ FORBIDDEN<br/>Can only edit own]
    OwnerCheck -->|Yes| Success3[✅ Allow]

    style Reject1 fill:#ff6b6b
    style Reject2 fill:#ff6b6b
    style Reject3 fill:#ff6b6b
    style Reject4 fill:#ff6b6b
    style Reject5 fill:#ff6b6b
    style Reject6 fill:#ff6b6b
    style Reject7 fill:#ff6b6b
    style Success1 fill:#51cf66
    style Success2 fill:#51cf66
    style Success3 fill:#51cf66
```

---

## 2️⃣ Layer 1: Authentication Guard (Already Implemented)

```mermaid
flowchart LR
    Request[Incoming Request] --> Session{Has<br/>session?}

    Session -->|No| E1[❌ UNAUTHORIZED]
    Session -->|Yes| Active{isActive<br/>= true?}

    Active -->|No| E2[❌ FORBIDDEN<br/>Account not active]
    Active -->|Yes| Role{roleGlobal<br/>≠ NONE?}

    Role -->|NONE| E3[❌ FORBIDDEN<br/>No permission]
    Role -->|Valid| Pass[✅ Pass to Layer 2]

    style E1 fill:#ff6b6b
    style E2 fill:#ff6b6b
    style E3 fill:#ff6b6b
    style Pass fill:#51cf66
```

---

## 3️⃣ Layer 2: Global Role Guard (Already Implemented)

```mermaid
flowchart TD
    Layer2[Layer 2 Check] --> ProcType{Procedure<br/>Type?}

    ProcType -->|protectedProcedure| ValidRole{roleGlobal in<br/>ADMIN, CEO, USER?}
    ProcType -->|adminProcedure| AdminRole{roleGlobal in<br/>ADMIN, CEO?}

    ValidRole -->|No| E1[❌ FORBIDDEN<br/>Invalid role]
    ValidRole -->|Yes| Pass1[✅ Pass to Layer 3]

    AdminRole -->|No| E2[❌ FORBIDDEN<br/>Admin access required]
    AdminRole -->|Yes| CEOCheck{Is CEO +<br/>Mutation?}

    CEOCheck -->|Yes| E3[❌ FORBIDDEN<br/>CEO read-only]
    CEOCheck -->|No| Pass2[✅ Pass to Layer 3]

    style E1 fill:#ff6b6b
    style E2 fill:#ff6b6b
    style E3 fill:#ff6b6b
    style Pass1 fill:#51cf66
    style Pass2 fill:#51cf66
```

---

## 4️⃣ Layer 3: Project Context Guard (To Be Implemented)

```mermaid
flowchart TD
    Layer3[Layer 3 Check] --> HasProject{Has<br/>projectId?}

    HasProject -->|No| GlobalAction[✅ Global Action<br/>Allow]
    HasProject -->|Yes| ProjectExists{Project<br/>exists?}

    ProjectExists -->|No| E1[❌ NOT_FOUND<br/>Project not found]
    ProjectExists -->|Yes| Member{User in<br/>ProjectMember?}

    Member -->|No| E2[❌ FORBIDDEN<br/>Not project member]
    Member -->|Yes| GetRole[Get ProjectRole]

    GetRole --> ActionCheck{Action allowed<br/>for role?}

    ActionCheck -->|No| E3[❌ FORBIDDEN<br/>Insufficient permissions]
    ActionCheck -->|Yes| OwnershipNeeded{Ownership<br/>required?}

    OwnershipNeeded -->|No| Success[✅ Allow]
    OwnershipNeeded -->|Yes| OwnerCheck{userId<br/>matches?}

    OwnerCheck -->|No| E4[❌ FORBIDDEN<br/>Can only edit own]
    OwnerCheck -->|Yes| Success2[✅ Allow]

    style E1 fill:#ff6b6b
    style E2 fill:#ff6b6b
    style E3 fill:#ff6b6b
    style E4 fill:#ff6b6b
    style GlobalAction fill:#51cf66
    style Success fill:#51cf66
    style Success2 fill:#51cf66
```

---

## 5️⃣ Ownership Guard Flow

```mermaid
flowchart LR
    Check[Ownership Check] --> Admin{Is ADMIN?}

    Admin -->|Yes| Bypass[✅ ADMIN bypasses<br/>ownership check]
    Admin -->|No| GetEntity[Fetch entity<br/>from DB]

    GetEntity --> Compare{entity.userId<br/>===<br/>ctx.user.id?}

    Compare -->|No| Reject[❌ FORBIDDEN<br/>Can only edit own]
    Compare -->|Yes| Allow[✅ Allow]

    style Bypass fill:#51cf66
    style Allow fill:#51cf66
    style Reject fill:#ff6b6b
```

---

## 6️⃣ Role-Specific Flows

### A. MANDOR Flow

```mermaid
flowchart TD
    Mandor[MANDOR Role] --> Actions{Action Type?}

    Actions -->|Daily Report| Report[✅ Create/Edit Own<br/>Upload Media]
    Actions -->|Emergency Fund| Emergency[✅ Request Fund<br/>❌ Verify]
    Actions -->|Logistics| Logistics[⚠️ Request IN/OUT<br/>❌ Confirm]
    Actions -->|Project Admin| Admin[❌ No Access]

    style Report fill:#51cf66
    style Emergency fill:#ffd43b
    style Logistics fill:#ffd43b
    style Admin fill:#ff6b6b
```

### B. ARCHITECT Flow

```mermaid
flowchart TD
    Architect[ARCHITECT Role] --> Actions{Action Type?}

    Actions -->|Daily Report| Report[✅ Create/Edit Own<br/>Upload Media]
    Actions -->|Emergency Fund| Emergency[❌ No Access]
    Actions -->|Logistics| Logistics[📖 Read Only]
    Actions -->|Project Admin| Admin[❌ No Access]

    style Report fill:#51cf66
    style Emergency fill:#ff6b6b
    style Logistics fill:#74c0fc
    style Admin fill:#ff6b6b
```

### C. FINANCE Flow

```mermaid
flowchart TD
    Finance[FINANCE Role] --> Actions{Action Type?}

    Actions -->|Daily Report| Report[❌ No Access]
    Actions -->|Emergency Fund| Emergency[✅ Verify Requests<br/>✅ Add Balance]
    Actions -->|Logistics| Logistics[✅ Full CRUD<br/>✅ Confirm Transactions]
    Actions -->|Project Admin| Admin[❌ No Access]

    style Report fill:#ff6b6b
    style Emergency fill:#51cf66
    style Logistics fill:#51cf66
    style Admin fill:#ff6b6b
```

---

## 7️⃣ Emergency Fund Workflow

```mermaid
sequenceDiagram
    participant M as MANDOR
    participant DB as Database
    participant F as FINANCE

    M->>DB: Create EmergencyTransaction<br/>(status: PENDING)
    DB-->>M: Transaction created

    Note over M,F: Waiting for verification

    F->>DB: Get pending transactions
    DB-->>F: List of PENDING

    F->>DB: Verify transaction<br/>(APPROVED/REJECTED)
    DB-->>F: Status updated

    alt APPROVED
        DB->>DB: Deduct from EmergencyFund.currentBalance
        Note over DB: Balance updated
    else REJECTED
        Note over DB: No balance change
    end

    DB-->>M: Notification: Request processed
```

---

## 8️⃣ Logistic Transaction Workflow (MANDOR Limited)

```mermaid
sequenceDiagram
    participant M as MANDOR
    participant DB as Database
    participant F as FINANCE

    M->>DB: Request Logistic OUT<br/>(status: PENDING)
    DB-->>M: Request created

    Note over M,F: Waiting for confirmation

    F->>DB: Get pending logistic requests
    DB-->>F: List of PENDING

    F->>DB: Confirm transaction<br/>(status: CONFIRMED)
    DB-->>F: Status updated

    DB->>DB: Update LogisticItem quantity
    Note over DB: Stock updated

    DB-->>M: Notification: Request confirmed
```

---

## 9️⃣ CEO Read-Only Enforcement

```mermaid
flowchart TD
    CEO[CEO User] --> Action{Action Type?}

    Action -->|Query/Read| Allow[✅ Allow<br/>All projects visible]
    Action -->|Mutation| Block[❌ FORBIDDEN<br/>CEO has read-only access]

    Allow --> Examples1["• View all projects<br/>• View all reports<br/>• View emergency funds<br/>• View logistics"]
    Block --> Examples2["• Create report<br/>• Verify emergency fund<br/>• Manage logistics<br/>• Edit project"]

    style Allow fill:#51cf66
    style Block fill:#ff6b6b
    style Examples1 fill:#d0ebff
    style Examples2 fill:#ffe0e0
```

---

## 🎯 Legend

| Color     | Meaning               |
| --------- | --------------------- |
| 🟢 Green  | Allowed / Success     |
| 🔴 Red    | Forbidden / Error     |
| 🟡 Yellow | Conditional / Limited |
| 🔵 Blue   | Read-only             |

---

**Document Version:** 1.0  
**Companion to:** [permission-matrix.md](file:///C:/Users/haqqi/.gemini/antigravity/brain/e7ca4093-7a8e-446d-92a7-8ac291978fb5/permission-matrix.md)
