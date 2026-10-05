# 07 — Salesforce Reports & Dashboards Specifications

## 1. Overview
Salesforce Reports and Dashboards provide real-time operational analytics for HR Admins and Managers without requiring custom code or external BI tools.

---

## 2. Standard Report Specifications

### Report 1: Attendance Summary Report
- **Report Type**: `Attendances with Employees`
- **Format**: Summary Report
- **Grouping**: Grouped by `Employee__c.Department__r.Name` then `Employee__c.Name`
- **Columns**: `Date__c`, `Check_In__c`, `Check_Out__c`, `Status__c`, `Working_Hours__c`
- **Aggregations**: `SUM(Working_Hours__c)`, `COUNT(Status__c)`
- **Chart Type**: Stacked Bar Chart (Present vs. Late vs. Absent per Department)

### Report 2: Leave Summary Report
- **Report Type**: `Leave Balances with Employees`
- **Format**: Summary Report
- **Grouping**: Grouped by `Employee__c.Name`
- **Columns**: `Leave_Type__c`, `Allocated_Days__c`, `Used_Days__c`, `Remaining_Days__c`
- **Aggregations**: `SUM(Allocated_Days__c)`, `SUM(Used_Days__c)`, `SUM(Remaining_Days__c)`
- **Chart Type**: Horizontal Bar Chart (Remaining Leave Days per Employee)

### Report 3: Leave Requests Status Report
- **Report Type**: `Leave Requests with Employees`
- **Format**: Tabular / Summary Report
- **Grouping**: Grouped by `Status__c` (`Pending`, `Approved`, `Rejected`, `Cancelled`)
- **Columns**: `Employee__c.Name`, `Leave_Type__c`, `Start_Date__c`, `End_Date__c`, `Number_of_Days__c`, `Reason__c`
- **Chart Type**: Donut Chart (Leave Request Status Distribution)

### Report 4: Department Attendance Percentage Report
- **Report Type**: `Attendances with Departments`
- **Format**: Matrix Report
- **Grouping**: Rows = `Department__c.Name`, Columns = `Status__c`
- **Aggregations**: Percentage formula `(COUNT(Present) + COUNT(Late)) / TOTAL_COUNT`
- **Chart Type**: Gauge Chart (Overall Company Attendance Rate %)

---

## 3. Executive HR Dashboard
The **HR Executive Dashboard** aggregates all 4 reports into a single screen:
1. **Metric Component 1**: Total Active Employees (Source: Employee Report)
2. **Gauge Component 2**: Today's Attendance Percentage Target (Target: 95%)
3. **Donut Chart Component 3**: Pending vs Approved Leave Requests
4. **Bar Chart Component 4**: Department-wise Absence Breakdown
