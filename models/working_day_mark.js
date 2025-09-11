var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WorkingDayMarkSchema = new Schema({
    staff_id: {
        type: Schema.Types.ObjectId
    },
    work_date: {
        type: Date,
        require: true
    },
    //0-day off, 1-working, 2-morning working, 3-afternoon working
    work_schedule_type:{
        type: Number
    },
    created_date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Working_Day_Mark', WorkingDayMarkSchema);
