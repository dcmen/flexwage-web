var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require("../models/pay_calculate");
require("../models/deduction");

var PayPeriodSchema = new Schema({
    company_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    today: {
        type: Date
    },
    end_date: {
        type: Date,
        required: true
    },
    //link to calendar type with salary employee: WEEKLY, FORTNIGHTLY(2 weeks), FOURWEEKLY, MONTHLY, TWICEMONTHLY
    xero_pay_calendar_id:{
        type: Schema.Types.ObjectId,
    },
    pay_calendar_type:{
        type: String
    },
    type_period: {
        type: Number
    },
    ppaynum: {
        type: Number
    },
    pay_calculate: mongoose.model('Pay_Calculate').schema,
    deductions: [mongoose.model('Deduction').schema],

    //KeyPay pay schedule
    keypay_pay_schedule_id:{
        type: Schema.Types.ObjectId
    },
    is_write_deductions_back_system: {
        type: Boolean,
        default: false
    },
    write_deductions_date: {
        type: Date
    },
    is_prevent_withdrawals: {
        type: Boolean,
        default: false
    },
    deduction_file_path:{
        type: String
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    //PENDING/REQUESTED/PROCESSING/PAID
    repayment_status: {
        type: String
    },
});

module.exports = mongoose.model('Pay_Period', PayPeriodSchema);
