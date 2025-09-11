var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LenderSchema = new Schema({
  lender_name: {
    type: String,
    require: true
  },
    //NEW_ACCOUNT, SUPPER_LENDER
  monoova_account_type: {
    type: String,
    require: true
  },
  //SELF_FINANCED, EXTERNAL_FINANCED, CASHD_FINANCED, SELF_CASHD_FINANCED
  funding_type: {
    type: String,
    require: true
  },
  test_receivables_account_name: {
    type: String
  },
  test_receivables_account_number: {
    type: String,
    require: true,
  },
  test_receivables_account_bsb: {
    type: String,
    require: true,
  },
  live_receivables_account_name: {
    type: String
  },
  live_receivables_account_number: {
    type: String,
  },
  live_receivables_account_bsb: {
    type: String,
  },
  //PERCENT / DOLLAR
  interest_rate_type: {
    type: String
  },
  interest_rate_value: {
    type: String
  },
  start_date: {
    type: Date
  },
  is_supper_lender: {
    type: Boolean,
    default: false
  },
  is_cashd: {
    type: Boolean,
    default: false
  },
  parent_id: {
    type: Schema.Types.ObjectId
  },
  live_account_number: {
    type: String
  },
  live_fee_account_number: {
    type: String,
  },
  live_api_key: {
    type: String,
  },
  test_account_number: {
    type: String
  },
  test_api_key: {
    type: String,
  },
  company_id: {
    type: Schema.Types.ObjectId
  },
  email: {
    type: String
  },
  mobile: {
    type: String
  },
  address: {
    type: String
  },
  status: {
    type: Number,
    default: 1
  },
  is_active: {
    type: Boolean,
    default: false
  },
  //mWallet
  wallet_test_identifier: {
    type: String
  },
  wallet_test_name: {
    type: String
  },
  wallet_test_account_number: {
    type: String
  },
  wallet_test_balance: {
    type: Number
  },
  wallet_live_identifier: {
    type: String
  },
  wallet_live_name: {
    type: String
  },
  wallet_live_account_number: {
    type: String
  },
  wallet_live_balance: {
    type: Number
  },
  wallet_created_date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lender', LenderSchema);