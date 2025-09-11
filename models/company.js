var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Xero_Deduction_Type = require("../models/xero/xero_deduction_type");
var Company_Brand = require("../models/company_brand");
require("../models/keypay/keypay_deduction_category");
require("../models/system");

var CompanySchema = new Schema({
    company_name: {
        type: String,
        required: true
    },
    system_id: {
        type: Schema.Types.ObjectId,
        default: null
    },
    address: {
        type: String
    },
    address2: {
        type: String,
        default: null
    },
    suburb: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    state: {
        type: String,
        default: null
    },
    postcode: {
        type: String,
        default: null
    },
    abn: {
        type: String,
        default: null
    },
    email_company: {
        type: String,
        default: null
    },
    phone_company: {
        type: String,
        default: null
    },
    cashdid_code : {
        type: Number
    },
    //0-PENDING, 1-ACTIVE, 2-INACTIVE
    is_active: {
        type: Schema.Types.Number,
        default: 1
    },
    brands: [mongoose.model('Company_Brand').schema],
    system_refresh_token : {
        type: String
    },
    system_base64_authentication : {
        type: String
    },
    system_tenant_id : {
        type: String
    },
    limit_mail_refresh_token:{
        type: Number,
        default: 0
    },
    last_time_mail_refresh_token:{
        type: Number,
        default: 0
    },
    system_company_id : {
        type: String
    },
    system_cm_cid : {
        type: String
    },
    system_api_username : {
        type: String
    },
    system_api_password : {
        type: String
    },
    system_creator_id : {
        type: Number
    },
    limit_number_of_employee:{
        type: Number,
        default: 100
    },
    limit_money:{
        type: Number,
        default: 10000
    },
    limit_allowable_percent_drawdown:{
        type: Number,
        default: 50
    },
    is_monoova_live_mode:{
        type: Boolean,
        default: false
    },
    short_code : {
        type: String
    },
    currency : {
        type: String
    },
    is_write_deductions_to_xero: {
        type: Schema.Types.Number,
        default: 0
    },
    deduction_type_xero_id: {
        type: Schema.Types.ObjectId
    },
    deduction_type_xero_fee_id: {
        type: Schema.Types.ObjectId
    },
    deduction_type_xero: mongoose.model('Xero_Deduction_Type').schema,

    keypay_deduction_category_id: {
        type: Schema.Types.ObjectId
    },
    keypay_deduction_category_fee_id: {
        type: Schema.Types.ObjectId
    },
    keypay_deduction_category: mongoose.model('KeyPay_Deduction_Category').schema,
    system_infor: mongoose.model('System').schema,
    last_synced: {
        type: Date,
        default: new Date()
    },
    transaction_fee_type: {
        type: String
    },
    transaction_fee_value: {
        type: Number
    },
    min_withdrawal:{
        type: Number,
        default: 50
    },
    is_fail_system_refresh_token:{
        type: Boolean,
        default: false
    },
    created_date: {
        type: Date,
        default: new Date()
    },
    is_enterprise: {
        type: Boolean
    },
    is_financial_setup: {
        type: Boolean,
        default: false
    },
    is_payroll_setup: {
        type: Boolean,
        default: false
    },
    deduction_file_method: {
        type: String
    },
    is_first_synced: {
        type: Boolean
    },
    is_verify_code_by_sms: {
        type: Boolean
    },
    lender_id: {
        type: Schema.Types.ObjectId,
    },
    kyc_approved: {
        type: Number
    },
    kyc_enable_company: {
        type: Number
    },
    comments: {
        type: String
    },
    is_validate_bank_account: {
        type: Boolean,
        default: false
    },
    // EMPLOYEES_IN_COMPANY, EMPLOYEE_TO_CASHD, EMPLOYEE_TO_BOTH
    chat_type: {
        type: String,
        default: "EMPLOYEE_TO_CASHD"
    },
    frequency_transaction_of_rate : {
        type: Number,
        default: 10
    },
    is_prevent_timesheet_request : {
        type: Boolean,
        default: false
    },
    is_system_approve_process : {
        type: Boolean,
        default: false
    },
    //ABA_FILE_VIA_PAYROLL_SYSTEM, DIRECT_DEBIT_AUTO_PAY, DIRECT_DEBIT_BY_APPROVAL, CASHD_GENERATED_ABA_FILE
    deduction_repayment_type: {
        type: String
    },
    bank_account_id : {
        type: Schema.Types.ObjectId
    },
    make_repayment_date: {
        type: Number, 
        default: 2
    },
    make_repayment_time: {
        type: Number,
        default: 1020
    },
    remind_write_deduction_date: {
        type: Number,
        default: 2
    },
    remind_write_deduction_time: {
        type: Number,
        default: 1020
    },
    threshold_amount: {
        type: Number,
        default: 0
    },
    recipients_float_alert: {
        type: [String]
    },
    payment_system_id: {
        type: String
    },
    language: {
        type: String
    },
    country_id: {
        type: Schema.Types.ObjectId
    },
});

module.exports = mongoose.model('Company', CompanySchema);
