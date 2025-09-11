var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LenderFinancialSchema = new Schema({
    lender_id: {
      type: Schema.Types.ObjectId,
      require: true
    },
    //CAPITAL_LOAN(Capital Loan), DEDUCTION_CAPITAL_FEE(Deduction (Capital + Fee)), 
    //DEDUCTION_CAPITAL (Deduction (Capital)), DEDUCTION_FEE (Deduction (Fee)), WITHDRAW (Withdraw), CAPITAL_REPAY (Capital Repay)
    type : {
      type: String,
      require: true
    },
    transactionId: {
      type: String
    },
    monoovaAccountNumber: {
      type: String
    },
    amount: {
      type: Number
    },
    fee: {
      type: Number
    },
    monoova_transaction_id: {
      type: Schema.Types.ObjectId
    },
    Date: {
      type: Date
    },
    created_date: {
      type: Date,
      default: Date.now
    }
});

module.exports = mongoose.model('Lender_Financial', LenderFinancialSchema);
