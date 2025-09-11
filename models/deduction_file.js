var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeductionFileSchema = new Schema({
    company_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    file_name: {
        type: String
    },
    file_path: {
        type: String
    },
    deduction_total_amount: {
        type: Number
    },
    date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Deduction_File', DeductionFileSchema);
