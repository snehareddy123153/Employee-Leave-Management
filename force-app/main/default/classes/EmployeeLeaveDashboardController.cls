public with sharing class EmployeeLeaveDashboardController {

    public class DashboardOverviewWrapper {
        @AuraEnabled public Employee__c employeeRecord { get; set; }
        @AuraEnabled public List<Leave_Balance__c> leaveBalances { get; set; }
        @AuraEnabled public Attendance__c todayAttendance { get; set; }
        @AuraEnabled public List<Leave_Request__c> recentLeaveRequests { get; set; }
    }

    /**
     * Retrieves overview data for the logged-in user's employee record, balances, attendance, and recent leave requests.
     */
    @AuraEnabled(cacheable=true)
    public static DashboardOverviewWrapper getDashboardOverview() {
        DashboardOverviewWrapper wrapper = new DashboardOverviewWrapper();
        Id currentUserId = UserInfo.getUserId();

        List<Employee__c> empList = [
            SELECT Id, Name, Employee_Id__c, Department__r.Name, Manager__r.Name, Role__c, Employment_Status__c
            FROM Employee__c
            WHERE User__c = :currentUserId
            LIMIT 1
        ];

        if (empList.isEmpty()) {
            return wrapper;
        }

        Employee__c emp = empList[0];
        wrapper.employeeRecord = emp;

        // Fetch Leave Balances for current year
        wrapper.leaveBalances = [
            SELECT Id, Leave_Type__c, Allocated_Days__c, Used_Days__c, Remaining_Days__c, Year__c
            FROM Leave_Balance__c
            WHERE Employee__c = :emp.Id AND Year__c = :Date.today().year()
        ];

        // Fetch Today's Attendance
        List<Attendance__c> todayAtt = [
            SELECT Id, Date__c, Check_In__c, Check_Out__c, Status__c, Working_Hours__c
            FROM Attendance__c
            WHERE Employee__c = :emp.Id AND Date__c = TODAY
            LIMIT 1
        ];
        wrapper.todayAttendance = !todayAtt.isEmpty() ? todayAtt[0] : null;

        // Fetch Recent Leave Requests
        wrapper.recentLeaveRequests = [
            SELECT Id, Name, Leave_Type__c, Start_Date__c, End_Date__c, Number_of_Days__c, Reason__c, Status__c, Manager_Comments__c
            FROM Leave_Request__c
            WHERE Employee__c = :emp.Id
            ORDER BY CreatedDate DESC
            LIMIT 10
        ];

        return wrapper;
    }

    /**
     * Submit a new Leave Request from LWC.
     */
    @AuraEnabled
    public static String submitLeaveRequest(String leaveType, Date startDate, Date endDate, String reason) {
        Id currentUserId = UserInfo.getUserId();
        List<Employee__c> empList = [SELECT Id, Manager__c FROM Employee__c WHERE User__c = :currentUserId LIMIT 1];
        
        if (empList.isEmpty()) {
            throw new AuraHandledException('No Employee record linked to the current user.');
        }

        Employee__c emp = empList[0];

        // Calculate Working Days
        Integer requestedDays = LeaveCalculationService.calculateWorkingDays(startDate, endDate);
        if (requestedDays <= 0) {
            throw new AuraHandledException('Selected date range contains 0 working days.');
        }

        // Validate Leave Balance
        Boolean hasBalance = LeaveCalculationService.validateLeaveBalance(emp.Id, leaveType, requestedDays);
        if (!hasBalance) {
            throw new AuraHandledException('Insufficient leave balance for ' + leaveType + '. Requested: ' + requestedDays + ' days.');
        }

        Leave_Request__c newReq = new Leave_Request__c(
            Employee__c = emp.Id,
            Leave_Type__c = leaveType,
            Start_Date__c = startDate,
            End_Date__c = endDate,
            Number_of_Days__c = requestedDays,
            Reason__c = reason,
            Status__c = 'Pending',
            Approver__c = emp.Manager__c
        );

        insert newReq;
        return newReq.Id;
    }

    /**
     * Clock In for Today's Attendance.
     */
    @AuraEnabled
    public static Attendance__c checkIn() {
        Id currentUserId = UserInfo.getUserId();
        List<Employee__c> empList = [SELECT Id FROM Employee__c WHERE User__c = :currentUserId LIMIT 1];
        
        if (empList.isEmpty()) {
            throw new AuraHandledException('No Employee record linked to current user.');
        }

        Id empId = empList[0].Id;
        List<Attendance__c> existing = [SELECT Id FROM Attendance__c WHERE Employee__c = :empId AND Date__c = TODAY LIMIT 1];
        if (!existing.isEmpty()) {
            throw new AuraHandledException('Duplicate check-in! You have already checked in for today.');
        }

        Datetime now = Datetime.now();
        String status = (now.time() > Time.newInstance(9, 30, 0, 0)) ? 'Late' : 'Present';

        Attendance__c att = new Attendance__c(
            Employee__c = empId,
            Date__c = Date.today(),
            Check_In__c = now,
            Status__c = status
        );

        insert att;
        return att;
    }
}
