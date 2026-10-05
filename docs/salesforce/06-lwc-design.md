# 06 — Lightning Web Components (LWC) Architecture

## 1. LWC Architecture Overview
The user interface for EmployeeHub is powered by standard Lightning Web Components adhering to the Salesforce LWC programming model.

```
       ┌────────────────────────────────────────────────────────┐
       │     employeeLeaveDashboard (LWC Component)             │
       └───────────────────────────┬────────────────────────────┘
                                   │ Wire / Imperative Calls
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │   EmployeeLeaveDashboardController (Apex Controller)   │
       └───────────────────────────┬────────────────────────────┘
                                   │ SOQL Query & Service Calls
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │         Salesforce Database (Custom Objects)           │
       └────────────────────────────────────────────────────────┘
```

---

## 2. Component Design Specifications (`employeeLeaveDashboard`)

### Data Retrieval & Reactive State
- **Wire Adapter**: `@wire(getDashboardOverview)` consumes the `@AuraEnabled(cacheable=true)` Apex controller method to automatically fetch:
  - Employee Details (`Name`, `Employee_Id__c`, `Department__r.Name`, `Role__c`)
  - Leave Balances array (`Leave_Type__c`, `Allocated_Days__c`, `Used_Days__c`, `Remaining_Days__c`)
  - Today's Attendance status badge (`Check_In__c`, `Status__c`)
  - Datatable of recent leave requests (`Name`, `Start_Date__c`, `End_Date__c`, `Status__c`)

### Dynamic Actions
- **Check-In Action**: Calls imperative Apex `checkIn()`, handles errors gracefully via SLDS Toast notifications (`ShowToastEvent`), and triggers `refreshApex()` to update state reactively without page reloading.
- **Apply Leave Modal**: Displays modal dialog with inputs for Leave Type dropdown (`lightning-combobox`), Start Date & End Date (`lightning-input`), and Reason (`lightning-textarea`).
- **Submission**: Calls `submitLeaveRequest()`, runs working day calculation, checks balances, and re-renders table seamlessly.

---

## 3. Lightning Design System (SLDS) Compliance
The LWC utilizes standard Salesforce SLDS utility classes:
- Cards: `lightning-card`
- Datatables: `lightning-datatable`
- Grid System: `slds-grid slds-wrap slds-gutters`
- Modals: `slds-modal slds-fade-in-open` & `slds-backdrop`
- Badges & Buttons: `lightning-badge`, `lightning-button`
