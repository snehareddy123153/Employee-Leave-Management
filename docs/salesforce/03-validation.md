# 03 — Salesforce Validation Rules Architecture

## 1. Overview
Declarative **Validation Rules** enforce business invariants in Salesforce prior to record insertion or updates. They execute BEFORE trigger handlers and workflow/flow automations, preventing invalid data from entering the database.

---

## 2. Implemented Validation Rules

### A. `End_Date_Before_Start_Date` on `Leave_Request__c`
- **Formula**: `End_Date__c < Start_Date__c`
- **Error Field**: `End_Date__c`
- **Error Message**: *"End Date cannot be earlier than Start Date."*
- **Business Rationale**: Ensures chronological integrity of requested date ranges.

### B. `Days_Must_Be_Positive` on `Leave_Request__c`
- **Formula**: `Number_of_Days__c <= 0`
- **Error Field**: `Number_of_Days__c`
- **Error Message**: *"Number of Days requested must be at least 1 working day."*
- **Business Rationale**: Prevents zero or negative leave requests.

### C. `Reason_Required` on `Leave_Request__c`
- **Formula**: `ISBLANK(Reason__c)`
- **Error Field**: `Reason__c`
- **Error Message**: *"A valid reason must be provided when submitting a leave request."*
- **Business Rationale**: Ensures auditability and manager visibility into leave purpose.

### D. `Self_Approval_Prevented` on `Leave_Request__c`
- **Formula**: 
  ```excel
  ISPICKVAL(Status__c, "Approved") && 
  Approver__r.User__c == $User.Id && 
  Employee__r.User__c == $User.Id
  ```
- **Error Message**: *"Managers cannot approve their own leave requests. Approval must be completed by a higher-level manager or HR."*
- **Business Rationale**: Eliminates conflict of interest and self-approval security compliance violations.

### E. `CheckOut_After_CheckIn` on `Attendance__c`
- **Formula**: `Check_Out__c < Check_In__c`
- **Error Field**: `Check_Out__c`
- **Error Message**: *"Check Out time cannot be earlier than Check In time."*
- **Business Rationale**: Prevents corrupted time tracking timestamps.
