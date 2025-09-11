var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Xero_Employee = require("./xero_employee");
var Xero_Timesheet_Line = require("./xero_timesheet_line");
var Deduction = require("../deduction");

var SchemaObject = new Schema({
  
  company_id:{
      type: Schema.Types.ObjectId,
      required: true
  },
  pay_period_id:{
    type: Schema.Types.ObjectId,
    default: null
  },
  TimesheetID: {
      type: String
    },
    EmployeeID: {
      type: String
    },
    Employee: {
      type: mongoose.model('Xero_Employee').schema
    },
    StartDate: {
      type: String
    },
    StartDateTimestamp: {
      type: Number
    },
    EndDate: {
      type: String
    },
    EndDateTimestamp: {
      type: Number
    },
    Status: {
      type: String
    },
    CasdDStatus: {
      type: String,
      default: 'PENDING'
    },
    Hours: {
      type: Number
    },
    TimesheetLines: {
      type: [mongoose.model('Xero_Timesheet_Line').schema]
    },
    //= 0: Pending, =1: Approved/Accepted, =4: Requested
    TimesheetLineStatus: {
      type: [Number]
    },
    UpdatedDateUTC: {
      type: String
    },
});

module.exports = mongoose.model('Xero_Timesheet', SchemaObject);
