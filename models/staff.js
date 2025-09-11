var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require("../models/deduction");
require("../models/company");
require("../models/xero/xero_salary_earnings_rate");
require("../models/xero/xero_payroll_calendar");
require("../models/astute/astute_rate");
require("../models/keypay/keypay_pay_schedule");
require("../models/bank_infor");

var UserSchema = new Schema({
    code: {
        type: String
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String
    },
    fullname: {
        type: String
    },
    alpha_sort: {
        type: String
    },
    mobile: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    male_femal: {
        type: Schema.Types.Number
    },
    is_linked_employee:{
        type: Boolean,
        default: false
    },
    limit_money:{
        type: Number,
        default: 100
    },
    limit_allowable_percent_drawdown:{
        type: Number,
        default: 50
    },
    min_withdrawal:{
        type: Number,
        default: 50
    },
    //company/brand id of Astute
    cm_cid : {
        type: String
    },

    //Salary:1, Timesheet/Wage: 2, 3: Both
    salary_wag: {
        type: Schema.Types.Number, 
        default: 1
    },
    //link to calendar type with salary employee: WEEKLY, FORTNIGHTLY(2 weeks), FOURWEEKLY, MONTHLY, TWICEMONTHLY
    xero_pay_calendar_id:{
        type: Schema.Types.ObjectId
    },
    xero_pay_calendar: mongoose.model('Xero_Pay_Calendar').schema,
    
    //earning rate of xero
    xero_salary_earnings_rates: [mongoose.model('Xero_Salary_Earnings_Rate').schema] ,
    //payroll calender id of current period
    xero_payroll_calendar_id: {
        type: Schema.Types.ObjectId,
    },
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
    salary: {
        type: Number
    },
    hours_per: {
        type: Number
    },
    hours_day: {
        type: Number
    },
    address: {
        type: String
    },
    suburb: {
        type: String
    },
    country: {
        type: String
    },
    birth_date: {
        type: Date
    },
    start_date: {
        type: String
    },
    company_id: {
        type: Schema.Types.ObjectId
    },
    user_id: {
        type: Schema.Types.ObjectId
    },
    bank_name: {
        type: String
    },
    bank_bsb_number: {
        type: String
    },
    bank_account_name: {
        type: String
    },
    bank_account_number: {
        type: String
    },
    deductions: [mongoose.model('Deduction').schema] ,
    system_user_id : {
        type: String
    },
    system_employee_id : {
        type: String
    },
    termination_date: {
        type: Date,
        default: null
    },
    company_infor:  mongoose.model('Company').schema,
    is_allow_login_other_system: {
        type: Schema.Types.Number,
        default: 0
    },
    cashdid_code: {
        type: Number
    },
    //0-SUSPEND, 1-ACTIVE, 2-INACTIVE, 3-TERMINATED
    is_active: {
        type: Schema.Types.Number,
        default: 1
    },
    //Astute system
    astute_rate: [mongoose.model('Astute_Rate').schema] ,
    astute_pay_frequency: {
        type: String
    },
    created_date: {
        type: Date,
        default: new Date()
    },
    //KeyPay system
    automatically_pay_employee : {
        type: String
    },
    keypay_rate_unit : {
        type: String
    },
    keypay_primary_pay_category : {
        type: String
    },
    hours_per_day : {
        type: Number
    },
    hours_per_week : {
        type: Number,
        default: 0
    },
    rate : {
        type: Number,
        default: 0
    },
    rate_per_hour : {
        type: Number,
        default: 0
    },
    keypay_pay_schedule_id:  {
        type: Schema.Types.ObjectId
    },
    keypay_pay_schedule: mongoose.model('Keypay_Pay_Schedule').schema,
    key_pay_work_types: {
        type: String
    },
    keypay_location_ids: {
        type : [ Schema.Types.ObjectId ],
        default: []
    },
    bank_account_id:  {
        type: Schema.Types.ObjectId
    },
    bank_account: mongoose.model('Bank_Infor').schema,
    deputy_payroll_id : {
        type: String
    },
    from_activation_code : {
        type: String
    },
    company_brand_id: {
        type: Schema.Types.ObjectId
    },
    pay_period_origination_id: {
        type: Schema.Types.ObjectId
    },
    // null/SUPERVISOR
    role: {
        type: String
    },
    is_limit_money_max_wallet: {
        type: Boolean,
        default: false
    },
    is_support: {
        type: Boolean,
        default: false
    },
    time_accrue_wages: {
        type: Number,
        default: 1020
    },
    business_unit_id: {
        type: Schema.Types.ObjectId
    }
});

module.exports = mongoose.model('Staff', UserSchema);
