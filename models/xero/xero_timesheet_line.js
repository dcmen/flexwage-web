var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Xero_Employee = require("./earnings_rate");

var SchemaObject = new Schema({
    EarningsRateID: {
      type: String
    },
    EarningsRate: {
      type: mongoose.model('Earnings_Rate').schema
    },
    NumberOfUnits: {
      type: [Number]
    },
    UpdatedDateUTC: {
      type: String
    }
});

module.exports = mongoose.model('Xero_Timesheet_Line', SchemaObject);
