var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema({
    system_id: {
        type: Schema.Types.ObjectId
    },
    name: {
        type: String
    },
    code: {
        type: String
    },
    created_date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
