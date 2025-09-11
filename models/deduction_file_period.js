var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeductionFilePeriodSchema = new Schema({
    deduction_file_id: {
        type: Schema.Types.ObjectId
    },
    pay_period_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    deduction_total_amount: {
        type: Number
    },
    date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Deduction_File_Period', DeductionFilePeriodSchema);
