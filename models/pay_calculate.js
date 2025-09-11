var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PayCalculateSchema = new Schema({
    pay_period_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    staff_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    //Salary:1, Timesheet/Wage: 2
    salary_wag: {
        type: Schema.Types.Number, 
        default: 1
    },
    //earning rate of xero
    xero_salary_earnings_rates: [mongoose.model('Xero_Salary_Earnings_Rate').schema] ,
    //=0 dont have any payslip in N months, =1 have less 1 payslip
    is_payslip_history: {
        type: Number,
        default: 0
    },
    //Setting number of working days in week from Monday to Friday with: 0-day off, 1-working, 2-morning working, 3-afternoon working
    working_days_of_week : {
        type: [Number],
        default: [1, 1, 1, 1, 1, 0, 0]
    },
    //Setting number of weeks to check payslip history/timesheet
    weeks_checking_payslip_history : {
        type: Number,
        default: 4
    },
    total_hours: {
        type: Number,
        default: 0
    },
    total_amount: {
        type: Number,
        default: 0
    },
    mount_per_day: {
        type: Number,
        default: 0
    },
    total_by_type: {
        type: String
    },
    cal_from_period_ppaynum: {
        type: Schema.Types.Number
    },
    cal_from_period_startdate: {
        type: Date
    },
    cal_from_period_enddate: {
        type: Date
    },
    netpay: {
        type: Number,
        default: 0
    },
    accured_amount: {
        type: Number,
        default: 0
    },
    limit_amount: {
        type: Number,
        default: 0
    },
    amount_available: {
        type: Number,
        default: 0
    },
    //0: Pending, 1: Success, 2: Failed
    deduction_status: {
        type: Number,
        default: 0
    },
    //Astute system
    astute_rate: [mongoose.model('Astute_Rate').schema] ,
    astute_pay_frequency: {
        type: String
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pay_Calculate', PayCalculateSchema);
