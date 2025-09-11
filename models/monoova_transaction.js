var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MonoovaTransactionSchema = new Schema({
    mPaymentsId: {
      type: String
    },
    monoovaAccountNumber : {
      type: String
    },
    transactionId : {
      type: String
    },
    transactionType: {
      type: String
    },
    subTransactionType: {
      type: String
    },
    live_mode: {
      type: Boolean,
      default: false
    },
    uniqueReference: {
      type: String
    },
    debit: {
      type: Number,
      default:0
    },
    credit: {
      type: Number,
      default:0
    },
    fee_debit: {
      type: Number,
      default:0
    },
    fee_credit: {
      type: Number,
      default:0
    },
    dateTime: {
      type: Date
    },
    isWaitingForFundsToClear: {
      type: Boolean
    },
    transactionDescription: {
      type: String
    },
    description:{
      type: String
    },
    mWalletAccountNumber: {
      type: String
    },
    //bank account receivables
    receivables_account_bsb: {
      type: String
    },
    receivables_account_number: {
      type: String
    },
    receivables_account_name: {
      type: String
    },
    receivables_transaction_id: {
      type: String
    },
    receivables_batch_id: {
      type: String
    },
    //CAPITAL_LOAN(Capital Loan), DEDUCTION_CAPITAL_FEE(Deduction (Capital + Fee)), 
    //DEDUCTION_CAPITAL (Deduction (Capital)), DEDUCTION_FEE (Deduction (Fee)), WITHDRAW (Withdraw), CAPITAL_REPAY (Capital Repay)
    receivables_type: {
      type: String
    },
    lodgementRef: {
      type: String
    },
    is_reconciled: {
      type: Boolean,
      default: true
    }
});

module.exports = mongoose.model('Monoova_Transaction', MonoovaTransactionSchema);
