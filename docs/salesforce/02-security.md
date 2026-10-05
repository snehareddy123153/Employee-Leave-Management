# 02 — Salesforce Security & Access Control Mapping

## 1. Security Architecture Overview
Salesforce security enforces data protection across four distinct layers:
1. **Organization-Level Access**: User authentication, IP restrictions, login hours.
2. **Object-Level & Field-Level Security (FLS)**: Profiles & Permission Sets.
3. **Record-Level Access (Sharing)**: OWDs, Role Hierarchy, Criteria-Based & Manual Sharing Rules.
4. **Programmatic Enforcement**: `with sharing` Apex keyword and `Security.stripInaccessible()`.

---

## 2. Role Mapping Matrix

| Role | Salesforce User Type | Profile / Permission Set | Record Sharing Mechanism |
| :--- | :--- | :--- | :--- |
| **Employee** | Standard Salesforce User | `Employee Standard Access` Permission Set | **OWD = Private**; Employees only see their OWN `Employee__c` and child records (`Leave_Request__c`, `Attendance__c`). |
| **Manager** | Standard Salesforce User | `Manager Team Access` Permission Set | **Role Hierarchy**: Managers inherit Read/Edit access to records owned by direct reports in their subtree. |
| **HR / Admin** | System Admin / HR User | `HR Admin Full Access` Permission Set | **View All / Modify All** or Criteria Sharing Rule granting access to all company records. |

---

## 3. Organization-Wide Defaults (OWD)
- **`Employee__c`**: `Private`
  - Ensures standard employees cannot browse other colleagues' salary, phone, address, or employment status details.
- **`Department__c`**: `Public Read-Only` or `Public Read/Write`
  - Departments are public organization metadata visible across the company.
- **`Leave_Balance__c`**: `Controlled by Parent`
  - Inherits `Private` visibility from `Employee__c`.
- **`Leave_Request__c`**: `Controlled by Parent`
  - Inherits `Private` visibility from `Employee__c`.
- **`Attendance__c`**: `Controlled by Parent`
  - Inherits `Private` visibility from `Employee__c`.

---

## 4. Role Hierarchy & Manager Sharing

```
              ┌─────────────────────────┐
              │   HR Admin / Executive  │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │     Engineering Lead    │ (Manager Role)
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   Software Engineer     │ (Employee Role)
              └─────────────────────────┘
```

- In Salesforce, enabling **"Grant Access Using Hierarchies"** on `Employee__c` guarantees that when an Employee creates a `Leave_Request__c` record, their Manager automatically gets Read and Edit access to approve/reject the request without needing manual sharing rules.

---

## 5. Field-Level Security (FLS) Highlights
- `Leave_Balance__c.Allocated_Days__c`: Read-only for Employees; Editable ONLY by HR Admin.
- `Leave_Balance__c.Used_Days__c`: Read-only for Employees & Managers; Updated programmatically via Apex/Flow upon Leave Approval.
- `Leave_Request__c.Status__c`: Read-only for Employee after creation; Editable by Approver/Manager.
