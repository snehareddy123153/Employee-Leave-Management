# 01 — Salesforce Data Model Architecture

## 1. Overview
The EmployeeHub application data architecture consists of **5 primary Custom Objects** designed with clear relational integrity, normalized structures, and scalability in mind.

```
       ┌──────────────────┐
       │   Department__c  │
       └────────┬─────────┘
                │ Lookup (1:N)
                ▼
       ┌──────────────────┐ ◄──────┐ Self-Lookup (Manager__c)
       │   Employee__c    ├────────┘
       └─┬────────┬──────┬┘
 Master- │ Master-│      │ Master-Detail (1:N)
 Detail  │ Detail │      ▼
         ▼        ▼  ┌──────────────┐
  ┌──────┐ ┌──────┐  │Attendance__c │
  │Leave_│ │Leave_│  └──────────────┘
  │Balan.│ │Reques│
  └──────┘ └──────┘
```

---

## 2. Object Specifications

### A. `Department__c`
Represents company divisions/departments.

- **Type**: Standard Custom Object
- **Sharing Model**: `ReadWrite` (Public Read/Write)
- **Fields**:
  - `Name` (Text, Required): Department Name (e.g. Engineering, HR, Sales)
  - `Department_Code__c` (Text(20), Unique, Case-Sensitive, Required): Code identifier (e.g. `ENG`, `HR`)
  - `Location__c` (Text(100)): Physical building/office location

### B. `Employee__c`
Represents active or inactive organization members.

- **Type**: Standard Custom Object
- **Sharing Model**: `Private`
- **Fields**:
  - `Name` (Text, Required): Employee Full Name
  - `Employee_Id__c` (Text(30), Unique, External ID, Required): Unique ID (e.g. `EMP-1001`)
  - `Department__c` (Lookup to `Department__c`): Associated department
  - `Manager__c` (Lookup to `Employee__c`): Self-referential lookup pointing to the employee's line manager
  - `User__c` (Lookup to `User`): Optional link to standard Salesforce User record for login/auth
  - `Joining_Date__c` (Date)
  - `Employment_Status__c` (Picklist: `Active`, `On Leave`, `Resigned`, `Terminated`)
  - `Role__c` (Picklist: `Employee`, `Manager`, `HR Admin`)

### C. `Leave_Balance__c`
Tracks allocated, used, and remaining annual leave quotas per employee per leave type.

- **Type**: Custom Child Object
- **Sharing Model**: `ControlledByParent` (Master-Detail to `Employee__c`)
- **Fields**:
  - `Employee__c` (Master-Detail to `Employee__c`, Required): Parent employee
  - `Leave_Type__c` (Picklist: `Casual Leave`, `Sick Leave`, `Earned Leave`)
  - `Allocated_Days__c` (Number(5,0), Required): Total days granted per year
  - `Used_Days__c` (Number(5,0), Default: 0): Consumed leave days
  - `Remaining_Days__c` (Formula Number: `Allocated_Days__c - Used_Days__c`): Auto-calculated remaining balance
  - `Year__c` (Number(4,0), Required): Quota year (e.g., 2026)

### D. `Leave_Request__c`
Stores leave applications submitted by employees awaiting manager approval.

- **Type**: Custom Child Object
- **Sharing Model**: `ControlledByParent` (Master-Detail to `Employee__c`)
- **Fields**:
  - `Employee__c` (Master-Detail to `Employee__c`, Required): Requesting employee
  - `Leave_Type__c` (Picklist: `Casual Leave`, `Sick Leave`, `Earned Leave`)
  - `Start_Date__c` (Date, Required): Leave start date
  - `End_Date__c` (Date, Required): Leave end date
  - `Number_of_Days__c` (Number(3,0), Required): Net working days requested (excluding Sat/Sun)
  - `Reason__c` (Long Text Area(1000), Required): Purpose of leave
  - `Status__c` (Picklist: `Pending`, `Approved`, `Rejected`, `Cancelled`, Default: `Pending`)
  - `Approver__c` (Lookup to `Employee__c`): Assigned manager approver
  - `Manager_Comments__c` (Text(255)): Feedback provided by manager during approval/rejection

### E. `Attendance__c`
Tracks daily employee check-in and check-out records.

- **Type**: Custom Child Object
- **Sharing Model**: `ControlledByParent` (Master-Detail to `Employee__c`)
- **Fields**:
  - `Employee__c` (Master-Detail to `Employee__c`, Required): Attending employee
  - `Date__c` (Date, Required): Attendance date
  - `Check_In__c` (DateTime): Clock-in timestamp
  - `Check_Out__c` (DateTime): Clock-out timestamp
  - `Status__c` (Picklist: `Present`, `Late`, `Absent`, `Half Day`, `Work From Home`)
  - `Working_Hours__c` (Number(4,2)): Calculated total shift duration in hours
  - `Remarks__c` (Text(255))

---

## 3. Relationship Architecture Justification

### Master-Detail vs. Lookup Decisions

1. **`Employee__c` → `Leave_Balance__c` (Master-Detail)**
   - *Why Master-Detail?* A leave balance has no standalone business value without an employee. If an employee record is deleted or purged, their leave balances must automatically cascade delete. Roll-up summary fields can also aggregate total consumed leave days directly onto the `Employee__c` record.

2. **`Employee__c` → `Leave_Request__c` (Master-Detail)**
   - *Why Master-Detail?* Security and ownership of a leave request inherit directly from the Employee record. If an employee is removed, historical requests belong strictly to the employee lifecycle context.

3. **`Employee__c` → `Attendance__c` (Master-Detail)**
   - *Why Master-Detail?* Attendance records strictly belong to an employee. Inherits security controls and allows roll-up analytics (e.g. Total Days Present this month).

4. **`Department__c` → `Employee__c` (Lookup)**
   - *Why Lookup instead of Master-Detail?* An employee exists independently of a department reorganization. Employees can transfer between departments without changing record ownership or requiring deletion/re-creation of employee profiles.

5. **`Employee__c` → `Employee__c` (Self-Lookup for Manager)**
   - *Why Self-Lookup?* Managers are also employees within the company. A self-referential lookup allows multi-tier organizational hierarchies (Employee -> Manager -> Senior Manager -> VP).
