var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
    PayRunID: {
      type: String
    },
    PayrollCalendarID: {
      type: String
    },
    PayRunPeriodStartDateTimestamp: {
      type: Number
    },
    PayRunPeriodEndDateTimestamp: {
      type: Number
    },
    PayslipID: {
      type: String
    },
    EmployeeID: {
      type: String
    },
    NetPay: {
      type: Number
    },
    Wages: {
      type: Number
    },
    Deductions: {
      type: Number
    },
    Tax: {
      type: Number
    },
    Super: {
      type: Number
    },
    Reimbursements: {
      type: Number
    },
});

module.exports = mongoose.model('Xero_Payslip', SchemaObject);
