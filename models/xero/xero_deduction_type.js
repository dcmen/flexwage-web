var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
    company_id: {
      type: Schema.Types.ObjectId
    },
    DeductionTypeID: {
      type: String
    },
    DeductionCategory: {
      type: String
    },
    Name: {
      type: String
    },
    AccountCode: {
      type: String
    },
    ReducesTax: {
      type: Boolean,
      default: false
    },
    ReducesSuper: {
      type: Boolean,
      default: false
    },
    IsExemptFromW1: {
      type: Boolean,
      default: false
    },
    CurrentRecord: {
      type: Boolean,
      default: false
    }
});

module.exports = mongoose.model('Xero_Deduction_Type', SchemaObject);
