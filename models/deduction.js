var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeductionSchema = new Schema({
    company_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    decode: {
        type: Schema.Types.Number,
        default: 0
    },
    code: {
        type: Schema.Types.Number,
        default: 0
    },
    name: {
        type: String
    },
    type: {
        type: Schema.Types.Number
    },
    amount: {
        type: Number, 
        default: 0
    },
    fee_amount: {
        type: Number, 
        default: 0
    },
    //Need to delete
    percent_fee: {
        type: Number
    },
    //PERCENT / DOLLAR
    transaction_fee_type: {
        type: String,
        default: "PERCENT"
    },
    transaction_fee_value: {
        type: Number,
        default: 2.75
    },
    total_deduction: {
        type: Number,
        default: 0
    },
    resource_from: {
        type: String
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    pay_deduction_id: {
        type: String
    },
    pay_period_ppaynum: {
        type: String
    },
    bank_bsb_number: {
        type: String
    },
    bank_account_name: {
        type: String
    },
    bank_account_number: {
        type: String
    },
    date: {
        type: Date
    }
});

module.exports = mongoose.model('Deduction', DeductionSchema);
