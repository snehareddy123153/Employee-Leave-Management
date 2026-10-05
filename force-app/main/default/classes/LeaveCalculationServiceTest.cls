@IsTest
private class LeaveCalculationServiceTest {

    @TestSetup
    static void setupTestData() {
        // Create Department
        Department__c dept = new Department__c(
            Name = 'Engineering',
            Department_Code__c = 'ENG',
            Location__c = 'Building A'
        );
        insert dept;

        // Create Employee
        Employee__c emp = new Employee__c(
            Name = 'Test Employee',
            Employee_Id__c = 'EMP-999',
            Department__c = dept.Id,
            Joining_Date__c = Date.today().addYears(-1),
            Employment_Status__c = 'Active',
            Role__c = 'Employee'
        );
        insert emp;

        // Create Leave Balance
        Leave_Balance__c lb = new Leave_Balance__c(
            Employee__c = emp.Id,
            Leave_Type__c = 'Casual Leave',
            Allocated_Days__c = 12,
            Used_Days__c = 2,
            Year__c = Date.today().year()
        );
        insert lb;
    }

    @IsTest
    static void testCalculateWorkingDays() {
        // Friday to Monday = 2 working days (Sat, Sun excluded)
        Date startDate = Date.newInstance(2026, 10, 9); // Friday
        Date endDate = Date.newInstance(2026, 10, 12);  // Monday

        Test.startTest();
        Integer days = LeaveCalculationService.calculateWorkingDays(startDate, endDate);
        Test.stopTest();

        System.assertEquals(2, days, 'Working days calculation should exclude Saturday and Sunday.');
    }

    @IsTest
    static void testValidateLeaveBalance() {
        Employee__c emp = [SELECT Id FROM Employee__c LIMIT 1];

        Test.startTest();
        Boolean hasBalance = LeaveCalculationService.validateLeaveBalance(emp.Id, 'Casual Leave', 5);
        Boolean exceedsBalance = LeaveCalculationService.validateLeaveBalance(emp.Id, 'Casual Leave', 15);
        Test.stopTest();

        System.assertTrue(hasBalance, 'Employee should have sufficient balance for 5 days.');
        System.assertFalse(exceedsBalance, 'Employee should NOT have balance for 15 days.');
    }

    @IsTest
    static void testProcessLeaveApprovalsBulk() {
        Employee__c emp = [SELECT Id FROM Employee__c LIMIT 1];

        Leave_Request__c req = new Leave_Request__c(
            Employee__c = emp.Id,
            Leave_Type__c = 'Casual Leave',
            Start_Date__c = Date.today(),
            End_Date__c = Date.today().addDays(2),
            Number_of_Days__c = 3,
            Reason__c = 'Personal work',
            Status__c = 'Approved'
        );
        insert req;

        Test.startTest();
        LeaveCalculationService.processLeaveApprovals(new Set<Id>{ req.Id });
        Test.stopTest();

        Leave_Balance__c updatedLb = [
            SELECT Used_Days__c, Remaining_Days__c 
            FROM Leave_Balance__c 
            WHERE Employee__c = :emp.Id AND Leave_Type__c = 'Casual Leave'
        ];

        System.assertEquals(5, updatedLb.Used_Days__c, 'Used days should be incremented from 2 to 5.');
        System.assertEquals(7, updatedLb.Remaining_Days__c, 'Remaining days should be 12 - 5 = 7.');
    }
}
