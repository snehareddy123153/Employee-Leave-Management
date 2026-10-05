# EmployeeHub — Employee Leave & Attendance Management (Salesforce Architecture Portfolio)

**EmployeeHub** is an internal enterprise application designed specifically as a production-style portfolio project for a Salesforce Admin + Developer candidate. Every business workflow, validation rule, data model entity, security constraint, and reporting metric in EmployeeHub directly maps 1:1 to standard Salesforce platform features.

---

## 🚀 Key Highlights & Architectural Equivalents

| Web / Business Concept | Salesforce Platform Implementation | Source Location in Repository |
| :--- | :--- | :--- |
| **Department Entity** | `Department__c` Custom Object | [`force-app/main/default/objects/Department__c`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/force-app/main/default/objects/Department__c) |
| **Employee Entity** | `Employee__c` Custom Object (with Self-Lookup Manager) | [`force-app/main/default/objects/Employee__c`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/force-app/main/default/objects/Employee__c) |
| **Leave Balance Quota** | `Leave_Balance__c` (Master-Detail to Employee) | [`force-app/main/default/objects/Leave_Balance__c`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/force-app/main/default/objects/Leave_Balance__c) |
| **Leave Request Entity** | `Leave_Request__c` (Master-Detail to Employee) | [`force-app/main/default/objects/Leave_Request__c`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/force-app/main/default/objects/Leave_Request__c) |
| **Attendance Clock-In/Out** | `Attendance__c` (Master-Detail to Employee) | [`force-app/main/default/objects/Attendance__c`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/force-app/main/default/objects/Attendance__c) |
| **Working-Day Calc & Balance Update** | **Bulkified Apex Service** (`LeaveCalculationService.cls`) | [`force-app/main/default/classes/LeaveCalculationService.cls`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/force-app/main/default/classes/LeaveCalculationService.cls) |
| **Business Validations** | **Salesforce Validation Rules** | [`force-app/main/default/objects/Leave_Request__c/validationRules`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/force-app/main/default/objects/Leave_Request__c/validationRules) |
| **Approval & Notifications** | **Record-Triggered Flows** | [`docs/salesforce/04-flow-automation.md`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/docs/salesforce/04-flow-automation.md) |
| **Interactive Employee UI** | **Lightning Web Component (LWC)** | [`force-app/main/default/lwc/employeeLeaveDashboard`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/force-app/main/default/lwc/employeeLeaveDashboard) |
| **Role Access & Security** | **Profiles, Permission Sets, OWD & Role Hierarchy** | [`force-app/main/default/permissionsets`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/force-app/main/default/permissionsets) |
| **Analytics & Metrics** | **Salesforce Reports & Dashboards** | [`docs/salesforce/07-reports-dashboard.md`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/docs/salesforce/07-reports-dashboard.md) |

---

## 📁 Repository Structure

```
Salesforce_Project/
├── force-app/main/default/
│   ├── classes/
│   │   ├── LeaveCalculationService.cls           # Bulk-safe working-day & balance Apex service
│   │   ├── LeaveCalculationServiceTest.cls       # 100% test coverage Apex unit test
│   │   ├── EmployeeLeaveDashboardController.cls  # @AuraEnabled controller for LWC
│   │   └── EmployeeLeaveDashboardController.cls-meta.xml
│   ├── lwc/
│   │   └── employeeLeaveDashboard/               # Enterprise LWC UI component
│   │       ├── employeeLeaveDashboard.html
│   │       ├── employeeLeaveDashboard.js
│   │       ├── employeeLeaveDashboard.css
│   │       └── employeeLeaveDashboard.js-meta.xml
│   ├── objects/                                  # Salesforce Custom Objects & Fields
│   │   ├── Department__c/
│   │   ├── Employee__c/
│   │   ├── Leave_Balance__c/
│   │   ├── Leave_Request__c/
│   │   │   └── validationRules/                 # Declarative Validation Rules
│   │   └── Attendance__c/
│   └── permissionsets/                           # Role-based Permission Sets
│       ├── Employee_Standard_Access.permissionset-meta.xml
│       ├── Manager_Team_Access.permissionset-meta.xml
│       └── HR_Admin_Full_Access.permissionset-meta.xml
├── docs/
│   ├── salesforce/                               # Complete Salesforce Architectural Docs
│   │   ├── 01-data-model.md
│   │   ├── 02-security.md
│   │   ├── 03-validation.md
│   │   ├── 04-flow-automation.md
│   │   ├── 05-apex-design.md
│   │   ├── 06-lwc-design.md
│   │   ├── 07-reports-dashboard.md
│   │   └── 08-interview-explanation.md
│   └── interview-questions.md                    # Detailed Interview QA Guide (12 Questions)
├── sfdx-project.json                             # Salesforce DX Project configuration
└── README.md
```

---

## 🔒 Security & Authorization Model
- **OWD**: Set to **Private** on `Employee__c` (and child records `ControlledByParent`).
- **Role Hierarchy**: Managers automatically inherit access to team records.
- **Permission Sets**:
  - `Employee Standard Access`: Standard read/create leave request & check-in.
  - `Manager Team Access`: Review team attendance & approve leave requests.
  - `HR Admin Full Access`: Manage departments, employee records, and org-wide leave balances.

---

## ⚡ Deployment to Salesforce Developer / Scratch Org
To deploy this project directly into a Salesforce Developer Org or Scratch Org using the Salesforce CLI (`sf` / `sfdx`):

```bash
# 1. Authorize your Salesforce Dev Org
sf org login web --alias DevOrg --set-default

# 2. Deploy source to Org
sf project deploy start --target-org DevOrg

# 3. Assign Permission Sets to Demo Users
sf org assign permset --name Employee_Standard_Access
sf org assign permset --name Manager_Team_Access
sf org assign permset --name HR_Admin_Full_Access

# 4. Run Apex Unit Tests
sf apex run test --test-level RunLocalTests --result-format human
```

---

## 🎯 Interview Preparation Checklist
Read through the complete interview prep resources before your interview:
1. [`docs/salesforce/08-interview-explanation.md`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/docs/salesforce/08-interview-explanation.md) — 30-second elevator pitch & key talking points.
2. [`docs/interview-questions.md`](file:///c:/Users/ravul/OneDrive/Desktop/Salesforce_Project/docs/interview-questions.md) — Concise, high-impact answers to 12 architectural questions.
