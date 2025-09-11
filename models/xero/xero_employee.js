var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
    EmployeeID: {
      type: String
    },
    FirstName: {
      type: String
    },
    MiddleNames: {
      type: String
    },
    LastName: {
      type: String
    },
    Email: {
      type: String
    },
    Gender: {
      type: String
    },
    Phone: {
      type: String
    },
    Mobile: {
      type: String
    },
    OrdinaryEarningsRateID: {
      type: String
    },
    PayrollCalendarID: {
      type: String
    }
});

module.exports = mongoose.model('Xero_Employee', SchemaObject);
