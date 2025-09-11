var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BankInforSchema = new Schema({
    staff_id: {
        type: Schema.Types.ObjectId
    },
    company_id: {
        type: Schema.Types.ObjectId
    },
    retailer_id: {
        type: Schema.Types.ObjectId
    },
    bank_name: {
        type: String
    },
    bank_bsb_number: {
        type: String
    },
    bank_bsb_number_encryption: {
        type: String
    },
    bank_account_name: {
        type: String
    },
    bank_system_id: {
        type: String
    },
    bank_account_number: {
        type: String
    },
    bank_account_number_encryption: {
        type: String
    },
    bank_user_id: {
        type: String
    },
    bank_apca_id: {
        type: String
    },
    bank_description: {
        type: String
    },
    bank_company_name: {
        type: String
    },
    created_date: {
        type: Date,
        default: new Date()
    },
    is_cashd_admin: {
        type: Number,
        default: 0
    },
    is_from_other_system: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Bank_Infor', BankInforSchema);
