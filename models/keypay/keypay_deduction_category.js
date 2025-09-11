var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
    company_id: {
      type: Schema.Types.ObjectId
    },
    deductionId: {
      type: String
    },
    name: {
      type: String
    },
    paymentSummaryClassification: {
      type: String
    }
});

module.exports = mongoose.model('KeyPay_Deduction_Category', SchemaObject);
