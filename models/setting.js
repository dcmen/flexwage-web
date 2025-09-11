var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SettingSchema = new Schema({
    
    transaction_fee_value: {
        type: Number
    },
    transaction_fee_type: {
        type: String
    },
    created_date: {
        type: Date,
        default: new Date()
    },
    encryption_key: {
        type: String,
    },
    frequency_transaction_of_rate : {
        type: Number,
        default: 10
    }
});

module.exports = mongoose.model('Setting', SettingSchema);
