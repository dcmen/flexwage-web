var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TimesheetSchema = new Schema({
    pay_period_id: {
        type: Schema.Types.ObjectId
    },
    staff_id: {
        type: Schema.Types.ObjectId
    },
    worked_date: {
        type: Date,
        require: true
    },
    created_date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Timesheet', TimesheetSchema);
