import { LightningElement, track, wire } from 'lwc';
import getDashboardOverview from '@salesforce/apex/EmployeeLeaveDashboardController.getDashboardOverview';
import submitLeaveRequest from '@salesforce/apex/EmployeeLeaveDashboardController.submitLeaveRequest';
import checkIn from '@salesforce/apex/EmployeeLeaveDashboardController.checkIn';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const COLUMNS = [
    { label: 'Request #', fieldName: 'Name' },
    { label: 'Leave Type', fieldName: 'Leave_Type__c' },
    { label: 'Start Date', fieldName: 'Start_Date__c', type: 'date' },
    { label: 'End Date', fieldName: 'End_Date__c', type: 'date' },
    { label: 'Days', fieldName: 'Number_of_Days__c', type: 'number' },
    { label: 'Status', fieldName: 'Status__c' },
    { label: 'Reason', fieldName: 'Reason__c' }
];

export default class EmployeeLeaveDashboard extends LightningElement {
    @track isLoading = true;
    @track employeeRecord;
    @track leaveBalances = [];
    @track todayAttendance;
    @track recentRequests = [];
    @track isModalOpen = false;

    leaveType = 'Casual Leave';
    startDate;
    endDate;
    reason = '';

    columns = COLUMNS;
    wiredOverviewResult;

    get currentYear() {
        return new Date().getFullYear();
    }

    get departmentName() {
        return this.employeeRecord?.Department__r?.Name || 'N/A';
    }

    get todayAttendanceStatusLabel() {
        if (!this.todayAttendance) return '';
        return `Checked In: ${this.todayAttendance.Status__c}`;
    }

    get leaveTypeOptions() {
        return [
            { label: 'Casual Leave', value: 'Casual Leave' },
            { label: 'Sick Leave', value: 'Sick Leave' },
            { label: 'Earned Leave', value: 'Earned Leave' }
        ];
    }

    @wire(getDashboardOverview)
    wiredOverview(result) {
        this.wiredOverviewResult = result;
        const { data, error } = result;
        this.isLoading = false;

        if (data) {
            this.employeeRecord = data.employeeRecord;
            this.leaveBalances = data.leaveBalances || [];
            this.todayAttendance = data.todayAttendance;
            this.recentRequests = data.recentLeaveRequests || [];
        } else if (error) {
            this.showToast('Error Loading Overview', error.body?.message || 'Failed to fetch dashboard data.', 'error');
        }
    }

    handleCheckIn() {
        this.isLoading = true;
        checkIn()
            .then(() => {
                this.showToast('Success', 'Check-in recorded successfully!', 'success');
                return refreshApex(this.wiredOverviewResult);
            })
            .catch((error) => {
                this.showToast('Check-in Failed', error.body?.message || 'Check-in error.', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    openApplyLeaveModal() {
        this.isModalOpen = true;
    }

    closeApplyLeaveModal() {
        this.isModalOpen = false;
        this.reason = '';
    }

    handleInputChange(event) {
        const field = event.target.name;
        this[field] = event.target.value;
    }

    handleSubmitLeave() {
        if (!this.startDate || !this.endDate || !this.reason) {
            this.showToast('Validation Error', 'Please complete all required fields.', 'warning');
            return;
        }

        this.isLoading = true;
        submitLeaveRequest({
            leaveType: this.leaveType,
            startDate: this.startDate,
            endDate: this.endDate,
            reason: this.reason
        })
            .then(() => {
                this.showToast('Submitted', 'Leave Request submitted successfully for manager approval.', 'success');
                this.closeApplyLeaveModal();
                return refreshApex(this.wiredOverviewResult);
            })
            .catch((error) => {
                this.showToast('Submission Failed', error.body?.message || 'Error creating request.', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
