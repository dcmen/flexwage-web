var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PayDeductionSchema = new Schema({
    pay_period_id: {
        type: Schema.Types.ObjectId
    },
    lender_id: {
        type: Schema.Types.ObjectId
    },
    staff_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    company_id: {
        type: Schema.Types.ObjectId
    },
    deduction_id: {
        type: Schema.Types.ObjectId
    },
    is_monoova_live_mode:{
        type: Boolean,
        default: false
    },
    is_write_back_system: {
        type: Number,
        default: 0
    },
    deduction_file_period_id:{
        type: Schema.Types.ObjectId
    },
    transaction_id: {
        type: String
    },
    //0: Pending, 1: Sent, 2: Cancelled, 3: Error, 4: ReSent
    aba_status: {
        type: Number,
        default: 0
    },
    aba_link: {
        type: String
    },
    csv_link: {
        type: String
    },
    pdid: {
        type: Number
    },
    date: {
        type: Date
    },
    created_date: {
        type: Date,
        default: new Date()
    },
    is_validate_small_transaction: {
        type: Boolean,
        default: null
    }
});

module.exports = mongoose.model('Pay_Deduction', PayDeductionSchema);
