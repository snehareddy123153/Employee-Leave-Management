# 05 — Salesforce Apex Architecture & Bulkification Design

## 1. Overview & Appropriate Apex Use Cases
Apex is reserved for complex business calculations and high-volume operations that cannot be handled cleanly in declarative Flow:
1. **Working-Day Calculation**: Iterating through date ranges and skipping Saturdays and Sundays.
2. **Bulk Leave Balance Deduction**: Querying and updating composite key maps (`Employee + LeaveType + Year`) in a bulk-safe manner.

---

## 2. Apex Design & Bulkification Patterns

### A. SOQL & DML Outside Loops
- **Anti-Pattern (Governor Limit Crash)**:
  ```java
  // BAD: SOQL inside loop -> Hits 100 SOQL limit at 101 records!
  for (Leave_Request__c req : triggerNew) {
      Leave_Balance__c lb = [SELECT Id FROM Leave_Balance__c WHERE Employee__c = :req.Employee__c];
      update lb; // BAD: DML inside loop -> Hits 150 DML limit!
  }
  ```
- **Bulk-Safe Solution (`LeaveCalculationService.cls`)**:
  ```java
  // GOOD: Collect IDs into Set
  Set<Id> employeeIds = new Set<Id>();
  for (Leave_Request__c req : requests) {
      employeeIds.add(req.Employee__c);
  }

  // GOOD: 1 SOQL Query for all records
  Map<String, Leave_Balance__c> balanceMap = new Map<String, Leave_Balance__c>();
  for (Leave_Balance__c lb : [SELECT Id, Used_Days__c FROM Leave_Balance__c WHERE Employee__c IN :employeeIds]) {
      balanceMap.put(lb.Employee__c + '_' + lb.Leave_Type__c + '_' + lb.Year__c, lb);
  }

  // GOOD: 1 DML Update statement outside loop
  update balancesToUpdate;
  ```

---

## 3. Class Structure & Unit Testing
- **Class**: `LeaveCalculationService.cls`
- **Controller**: `EmployeeLeaveDashboardController.cls`
- **Test Coverage**: `LeaveCalculationServiceTest.cls` (100% coverage verifying positive, negative, and bulk scenarios up to 200 records).
