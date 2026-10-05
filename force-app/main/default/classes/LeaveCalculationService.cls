public with sharing class LeaveCalculationService {
    
    /**
     * Calculates the number of working days between startDate and endDate, excluding Saturdays and Sundays.
     */
    public static Integer calculateWorkingDays(Date startDate, Date endDate) {
        if (startDate == null || endDate == null || endDate < startDate) {
            return 0;
        }

        Integer workingDays = 0;
        Date currentDate = startDate;

        while (currentDate <= endDate) {
            // DateTime format 'u' returns 1 for Monday through 7 for Sunday
            Datetime dt = Datetime.newInstance(currentDate.year(), currentDate.month(), currentDate.day());
            String dayOfWeek = dt.format('u');
            
            // 6 = Saturday, 7 = Sunday
            if (dayOfWeek != '6' && dayOfWeek != '7') {
                workingDays++;
            }
            currentDate = currentDate.addDays(1);
        }

        return workingDays;
    }

    /**
     * Validates whether an employee has sufficient remaining leave balance for a request.
     */
    public static Boolean validateLeaveBalance(Id employeeId, String leaveType, Integer requestedDays) {
        if (employeeId == null || String.isBlank(leaveType) || requestedDays == null || requestedDays <= 0) {
            return false;
        }

        Integer currentYear = Date.today().year();
        List<Leave_Balance__c> balances = [
            SELECT Id, Allocated_Days__c, Used_Days__c, Remaining_Days__c
            FROM Leave_Balance__c
            WHERE Employee__c = :employeeId
              AND Leave_Type__c = :leaveType
              AND Year__c = :currentYear
            LIMIT 1
        ];

        if (balances.isEmpty()) {
            return false;
        }

        return balances[0].Remaining_Days__c >= requestedDays;
    }

    /**
     * Bulkified method to process approved leave requests and update corresponding Leave_Balance__c records.
     */
    public static void processLeaveApprovals(Set<Id> approvedRequestIds) {
        if (approvedRequestIds == null || approvedRequestIds.isEmpty()) {
            return;
        }

        // Fetch Approved Leave Requests
        List<Leave_Request__c> requests = [
            SELECT Id, Employee__c, Leave_Type__c, Number_of_Days__c, Start_Date__c
            FROM Leave_Request__c
            WHERE Id IN :approvedRequestIds AND Status__c = 'Approved'
        ];

        if (requests.isEmpty()) {
            return;
        }

        // Collect Employee IDs and Years for bulk query
        Set<Id> employeeIds = new Set<Id>();
        Set<Integer> years = new Set<Integer>();

        for (Leave_Request__c req : requests) {
            employeeIds.add(req.Employee__c);
            years.add(req.Start_Date__c.year());
        }

        // Bulk SOQL Query to fetch Leave Balances into a composite key Map
        // Composite Key: EmployeeId + '_' + LeaveType + '_' + Year
        Map<String, Leave_Balance__c> balanceMap = new Map<String, Leave_Balance__c>();
        for (Leave_Balance__c lb : [
            SELECT Id, Employee__c, Leave_Type__c, Year__c, Used_Days__c, Allocated_Days__c
            FROM Leave_Balance__c
            WHERE Employee__c IN :employeeIds AND Year__c IN :years
        ]) {
            String key = lb.Employee__c + '_' + lb.Leave_Type__c + '_' + Integer.valueOf(lb.Year__c);
            balanceMap.put(key, lb);
        }

        List<Leave_Balance__c> balancesToUpdate = new List<Leave_Balance__c>();
        Set<Id> updatedBalanceIds = new Set<Id>();

        for (Leave_Request__c req : requests) {
            String key = req.Employee__c + '_' + req.Leave_Type__c + '_' + req.Start_Date__c.year();
            if (balanceMap.containsKey(key)) {
                Leave_Balance__c lb = balanceMap.get(key);
                
                // Prevent duplicate updates in single execution context
                if (!updatedBalanceIds.contains(lb.Id)) {
                    Decimal currentUsed = lb.Used_Days__c != null ? lb.Used_Days__c : 0;
                    lb.Used_Days__c = currentUsed + req.Number_of_Days__c;
                    balancesToUpdate.add(lb);
                    updatedBalanceIds.add(lb.Id);
                } else {
                    lb.Used_Days__c += req.Number_of_Days__c;
                }
            }
        }

        // Bulk DML Update
        if (!balancesToUpdate.isEmpty()) {
            update balancesToUpdate;
        }
    }
}
