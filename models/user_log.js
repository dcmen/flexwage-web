const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserLogSchema = new Schema({
   user_id: Schema.Types.ObjectId,
    staff_id: Schema.Types.ObjectId,
    create_date: {
        type: Date
    }
});

module.exports = mongoose.model('UserLog', UserLogSchema);