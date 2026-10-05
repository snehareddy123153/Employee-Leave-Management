# 04 — Salesforce Flow Automation Architecture

## 1. Declarative Automation Strategy
Salesforce best practices dictate using **Record-Triggered Flows** over Apex triggers whenever business logic can be achieved declaratively without complex math, heavy loop iterations, or cross-object bulk calculations.

---

## 2. Core Flow Specifications

### Flow 1: Leave Request Submitted Notification
- **Trigger**: `Leave_Request__c` is created with `Status__c = 'Pending'`.
- **Type**: Record-Triggered Flow (After-Save).
- **Actions**:
  1. Retrieve `Employee__r.Manager__r.User__c` email address.
  2. Send Custom Bell Notification & Email Alert to line manager.
  3. Update `Approver__c` field to point to `Employee__r.Manager__c`.
- **Why Flow over Apex?** Out-of-the-box email templates, Bell Notifications, and zero code maintenance.

### Flow 2: Leave Request Approved — Balance Update Trigger
- **Trigger**: `Leave_Request__c` is updated to `Status__c = 'Approved'`.
- **Type**: Record-Triggered Flow (After-Save).
- **Actions**:
  1. Call Apex Action `LeaveCalculationService.processLeaveApprovals($Record.Id)` for bulk-safe leave balance deductions.
  2. Send Email Notification to Employee confirming approval.
- **Why Hybrid Flow + Apex?** Flow handles the event trigger and notification; Apex performs bulk-safe math to avoid SOQL/DML governor limits across multiple simultaneous approvals.

### Flow 3: Attendance Check-In Status Evaluation
- **Trigger**: `Attendance__c` is created with non-null `Check_In__c`.
- **Type**: Record-Triggered Flow (Before-Save).
- **Formula Condition**:
  ```excel
  IF(TIMEVALUE($Record.Check_In__c) > TIMEVALUE("09:30:00.000"), "Late", "Present")
  ```
- **Action**: Update `$Record.Status__c` before record is committed to database.
- **Why Flow over Apex?** Fast before-save updates run with zero performance overhead and consume zero SOQL calls.
