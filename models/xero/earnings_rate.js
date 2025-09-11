var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
  EarningsRateID: {
      type: String
    },
    Name: {
      type: String
    },
    EarningsType: {
      type: String
    },
    RateType: {
      type: String
    },
    AccountCode: {
      type: String
    },
    TypeOfUnits: {
      type: String
    },
    RatePerUnit: {
      type: Number,
      default: 0
    },
    IsExemptFromTax: {
      type: String
    },
    IsExemptFromSuper: {
      type: String
    },
    IsReportableAsW1: {
      type: String
    },
    CurrentRecord: {
      type: String
    }
});

module.exports = mongoose.model('Earnings_Rate', SchemaObject);
