# 08 — Salesforce Interview Pitch & Project Explanation Strategy

## 1. How to Present EmployeeHub in an Interview

### The 30-Second Elevator Pitch
> *"I designed and built **EmployeeHub**, an internal company Leave & Attendance Management System structured explicitly around Salesforce architecture principles. It manages employees, departments, leave quotas, approval workflows, daily attendance, and HR analytics. I modeled the domain using 5 custom objects, built declarative validations and Record-Triggered Flows, developed bulkified Apex services for working-day calculations and balance updates, created a reactive LWC dashboard for employees, and configured Salesforce security controls including OWDs, Role Hierarchy, and Permission Sets."*

---

## 2. Key Architecture Discussion Points

### A. Data Modeling Choices
- *"I chose **Master-Detail** relationships for `Leave_Balance__c`, `Leave_Request__c`, and `Attendance__c` to `Employee__c` because child records have no independent existence outside the employee lifecycle, and security should strictly inherit from the employee record."*
- *"I chose **Lookup** for `Department__c` to `Employee__c` because an employee can transfer between departments without deleting their profile, and for `Manager__c` self-lookup to model hierarchical line management."*

### B. Declarative vs. Programmatic Automation
- *"I adhered to the Salesforce rule: **Declarative first, Apex when required**. For approval routing and check-in status calculation, I designed **Record-Triggered Flows**. For working-day calculation (excluding Saturdays and Sundays) and bulk-safe leave balance deductions, I used an **Apex service class**."*

### C. Bulkification Mastery
- *"I ensured my Apex code was completely bulk-safe by using `Sets` to collect parent IDs, querying all records in a single SOQL statement outside loops, storing child records in composite-key `Maps`, and issuing a single DML update statement."*

### D. Security Architecture
- *"I configured **OWD to Private** on `Employee__c` to protect personal employee data. I utilized Salesforce **Role Hierarchy** so line managers automatically inherit read/write access to their team's records without requiring complex Apex sharing rules."*
