# EmployeeHub — Salesforce Interview Questions & Answers Guide

This document contains precise, impressive answers to the key architectural questions asked in Salesforce Admin + Developer interviews based on the **EmployeeHub** project.

---

### Q1: Why did you choose these custom objects?
**Answer**:
> *"I designed 5 custom objects (`Department__c`, `Employee__c`, `Leave_Balance__c`, `Leave_Request__c`, and `Attendance__c`) to normalize the business domain cleanly. `Employee__c` acts as the core hub record representing organization members. `Leave_Balance__c` isolates leave type quotas per employee per year. `Leave_Request__c` records transactional leave applications, and `Attendance__c` tracks daily clock-in/out timestamps. This separation ensures scalability, historical auditability, and easy reporting."*

---

### Q2: Why did you use Lookup vs Master-Detail relationships for each object?
**Answer**:
> - ***Master-Detail (`Employee__c` → `Leave_Balance__c`, `Leave_Request__c`, `Attendance__c`)***: These child records have no independent existence without an Employee. Deleting an employee should cascade delete their balances and attendance history. It also enables roll-up summary fields on Employee and enforces inherited record security.
> - ***Lookup (`Department__c` → `Employee__c`)***: An employee can change departments during reorganization without deleting or re-creating their record.
> - ***Self-Lookup (`Employee__c` → `Employee__c` for Manager)***: Managers are also employees. A self-referential lookup supports multi-tier managerial hierarchies.

---

### Q3: Why did you use Flow instead of Apex for certain automations?
**Answer**:
> *"I followed Salesforce best practices: **Use Flow for declarative automation, reserve Apex for complex logic**. Flows were ideal for:
> 1. Email notifications and Bell alerts when a leave request is submitted.
> 2. Auto-evaluating late vs. present status on Check-In using Before-Save Flow formulas with zero SOQL overhead.
> Flow provides zero-code maintenance, out-of-the-box email actions, and superior performance for simple field updates."*

---

### Q4: Where was Apex strictly necessary in this project?
**Answer**:
> *"Apex was necessary for **Working-Day Calculation** and **Bulk Balance Deductions**. Calculating leave days requires iterating through date ranges to exclude Saturdays and Sundays dynamically. Additionally, updating leave balances upon batch approval requires composite-key mapping (`EmployeeId + LeaveType + Year`) and bulkified DML operations, which cannot be done cleanly in standard Flow."*

---

### Q5: How did you ensure your Apex code is bulk-safe?
**Answer**:
> *"I followed three core bulkification rules in `LeaveCalculationService.cls`:
> 1. **No SOQL inside loops**: Collected all `EmployeeId` and `Year` values into `Sets` and executed a single bulk SOQL query.
> 2. **Composite Key Maps**: Populated a `Map<String, Leave_Balance__c>` to perform instant $O(1)$ memory lookups during processing.
> 3. **No DML inside loops**: Accumulated updated balance records into a `List<Leave_Balance__c>` and executed a single `update` DML statement outside the loop."*

---

### Q6: How did you secure Employee records so employees only see their own data?
**Answer**:
> *"I set the **Organization-Wide Default (OWD)** for `Employee__c` to **Private**.
> 1. **Standard Employees** only see records they own.
> 2. **Managers** automatically inherit Read/Edit access to their direct reports' records via the **Role Hierarchy** ('Grant Access Using Hierarchies').
> 3. **HR Admins** gain org-wide access via the **HR Admin Full Access** Permission Set."*

---

### Q7: How do you prevent negative leave balances?
**Answer**:
> *"At the application level, `LeaveCalculationService.validateLeaveBalance()` checks if `Remaining_Days__c >= RequestedDays` prior to insertion. At the database level, `Remaining_Days__c` is a formula field (`Allocated_Days__c - Used_Days__c`). Additionally, a Validation Rule or Apex trigger prevents `Used_Days__c` from exceeding `Allocated_Days__c`."*

---

### Q8: How would your architecture scale to 10,000 employees submitting leave simultaneously?
**Answer**:
> *"1. **Bulkified Apex Triggers & Async Processing**: Use `@future` or `Queueable` Apex for background notification processing to avoid synchronous CPU time limits.
> 2. **Database Indexing**: Mark `Employee_Id__c` and external IDs as Indexed/External ID to speed up SOQL query execution.
> 3. **Selective SOQL**: Filter SOQL queries using indexed fields (`Year__c`, `Employee__c`, `Status__c`) to keep query response times under 50ms.
> 4. **Platform Events**: Offload heavy notifications to Platform Events decoupled from record save transactions."*

---

### Q9: How does the LWC communicate with Salesforce?
**Answer**:
> *"The LWC imports `@AuraEnabled(cacheable=true)` methods from `EmployeeLeaveDashboardController.cls`. It uses the `@wire` service for reactive, cached read operations (`getDashboardOverview`), and imperative Apex calls for mutations (`checkIn()`, `submitLeaveRequest()`). Upon mutation, `refreshApex()` invalidates the cache and re-fetches updated data seamlessly."*

---

### Q10: Why use Permission Sets instead of Profiles for role access?
**Answer**:
> *"Salesforce best practices recommend keeping Profiles minimal and granting permissions via **Permission Sets** and **Permission Set Groups**. This follows the principle of least privilege, allowing modular assignment (e.g., granting Manager access to a temp lead without changing their baseline Profile)."*

---

### Q11: How do Managers access only their team's records?
**Answer**:
> *"Manager access is handled naturally through the **Salesforce Role Hierarchy**. When an employee's record is set to Private, any user positioned above that employee in the Role Hierarchy automatically inherits Read and Edit access to those records."*

---

### Q12: How did you unit test the Apex logic?
**Answer**:
> *"I created `LeaveCalculationServiceTest.cls` using `@TestSetup` to construct mock `Department__c`, `Employee__c`, and `Leave_Balance__c` records isolated from org data. I wrote tests covering:
> 1. Positive working-day calculations (excluding Sat/Sun).
> 2. Negative/Boundary date conditions.
> 3. Bulk processing of 200 approved leave requests in a single transaction to verify governor limit safety and 100% test coverage."*
