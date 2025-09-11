var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Notification = require("./notifications");

var NotificationCompanySettingSchema = new Schema({
    company_id: {
        type: Schema.Types.ObjectId
    },
    notification_id: {
        type: Schema.Types.ObjectId
    },
    status: {
        type: Number,
        default: 0
    },
    notification: mongoose.model('Notification').schema,
    created_date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Notification_Company_Setting', NotificationCompanySettingSchema);
