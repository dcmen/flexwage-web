var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
    earnings_rate_id: {
      type: String
    },
    name: {
      type: String
    },
    earnings_type: {
      type: String
    },
    account_code: {
      type: Number
    },
    calculation_type: {
      type: String
    },
    annual_salary: {
      type: Number
    },
    number_of_units_per_week: {
      type: Number
    }
});

module.exports = mongoose.model('Xero_Salary_Earnings_Rate', SchemaObject);
