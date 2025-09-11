var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeductionFileStaffSchema = new Schema({
    deduction_period_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    staff_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    staff_fullname: {
        type: String
    },
    deduction_amount: {
        type: Number
    },
    deduction_fee: {
        type: Number
    },
    deduction_total_amount: {
        type: Number
    },
    deputy_payroll_id: {
        type: String
    },
    date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Deduction_File_Staff', DeductionFileStaffSchema);
