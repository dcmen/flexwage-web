var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var XeroPayrollCalendarObject = new Schema({
    company_id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    PayrollCalendarID: {
      type: String
    },  
    Name: {
      type: String
    },
    //WEEKLY, FORTNIGHTLY(2 weeks), FOURWEEKLY, MONTHLY, TWICEMONTHLY
    CalendarType: {
      type: String
    },
    StartDateTimestamp: {
      type: Number
    },
    created_date: {
      type: Date,
      default: new Date()
    },
    schedule_sub_date: {
      type: Number
    },
    schedule_minute_time: {
      type: Number
    }
});

module.exports = mongoose.model('Xero_Pay_Calendar', XeroPayrollCalendarObject);
